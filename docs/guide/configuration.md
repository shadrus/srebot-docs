# Конфигурация SREBot (Helm / Env)

Настройки SREBot агента можно задавать с помощью **переменных окружения (Env Vars)** или через конфигурационный файл **`config.yml`** (который Helm-чарт монтирует внутрь пода). В данной статье описаны все доступные параметры.

## Базовые настройки подключения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather. | `""` |
| `TELEGRAM_CHANNEL_ID` | Идентификатор целевого Telegram-чата/канала. | `0` |
| `SLACK_BOT_TOKEN` | Bot User OAuth Token Slack-приложения (`xoxb-...`). | `""` |
| `SLACK_APP_TOKEN` | App-Level Token для Socket Mode (`xapp-...`). | `""` |
| `SLACK_CHANNEL_ID` | ID Slack-канала, который бот будет слушать. | `""` |
| `SAAS_AGENT_TOKEN` | Секретный токен для связи с SREBot Дашбордом. | `""` |
| `SAAS_WS_URL` | WebSocket URL бэкенда платформы. | `wss://api.srebot.site360.tech/api/v1/agent/connect` |
| `REDIS_URL` | URL подключения к Redis для дедупликации алертов. | `redis://localhost:6379/0` |

## Поведение AI (LLM) и парсера

| Переменная | Описание | По умолчанию |
|---|---|---|
| `LLM_RESPONSE_LANGUAGE` | Язык ответа RCA-отчета. Например: `Russian`, `English`. | `English` |
| `LLM_MAX_ITERATIONS` | Максимальное число шагов (использования тулзов) на один алерт. | `10` |
| `ALERT_FINGERPRINT_TTL` | Время жизни алерта в кэше (в секундах). Если аналогичный алерт придет до истечения таймера, он будет проигнорирован. | `86400` (24ч) |
| `BOT_CONTAINER_NAME` | Имя контейнера самого бота, чтобы он случайно не читал собственные логи из Elasticsearch. | `ai-observability-bot` |

## Системные флаги
- `LOG_LEVEL`: Уровень логирования бота (`DEBUG`, `INFO`, `WARNING`, `ERROR`). По умолчанию `INFO`.
- `DRY_RUN`: Если `True`, бот проведет анализ, выведет текст в логи контейнера, но **не будет отправлять сообщение** в чат. Удобно для локального дебага.

---

## Добавочная конфигурация (`config.yml` / Helm `values.yaml`)

Кроме плоских переменных, бот поддерживает богатую структуру в виде YAML, которая используется для продвинутых фильтров и интеграций:

### 1. Интеграция MCP-серверов (Model Context Protocol)

Через секцию `mcp_servers` вы можете подключать внешние инструменты (Prometheus, Elasticsearch, Kubernetes, внутренние API) прямо в логику AI-агента.

Каждый сервер поддерживает следующие поля:

| Поле | Описание |
|---|---|
| `command` | Команда для запуска MCP-сервера. |
| `args` | Аргументы командной строки. |
| `env` | Переменные окружения, передаваемые процессу сервера. |
| `read_only` | Если `true`, бот скрывает от LLM все инструменты с мутирующими операциями: `create_`, `delete_`, `update_`, `bulk`, `reindex` и т.д. Используйте для Elasticsearch/БД, чтобы AI-агент не мог случайно изменить данные. |
| `condition` | Фильтр по labels алерта. Если задан, сервер будет использоваться только для алертов, соответствующих условию. Удобно для мульти-кластерных сред (см. пример ниже). |

**Базовый пример:**
```yaml
mcp_servers:
  prometheus:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-prometheus", "--url", "http://prom:9090"]
  elasticsearch:
    command: "python"
    args: ["-m", "mcp_es_server"]
    env:
      ES_URL: "http://es:9200"
    read_only: true
```

**Пример с несколькими кластерами (condition):**

Если в вашей инфраструктуре несколько Kubernetes-кластеров с разными Prometheus — можно привязать каждый MCP-сервер к своему кластеру через `condition`. LLM-агент автоматически получит инструменты только для кластера из пришедшего алерта.

```yaml
mcp_servers:
  prod-prometheus:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-prometheus", "--url", "http://prod-prom:9090"]
    condition:
      labels:
        cluster: "prod-cluster"
  staging-prometheus:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-prometheus", "--url", "http://staging-prom:9090"]
    condition:
      labels:
        cluster: "staging-cluster"
```

---

### 2. Правила игнорирования алертов (Ignore Rules)

Определяет список условий, при которых бот должен полностью игнорировать тревогу и не тратить токены на AI-анализ.

#### Простые условия (совпадение по labels)

Все перечисленные labels должны совпасть одновременно (логика **AND**):

```yaml
ignore_rules:
  - name: "Игнорировать тестовые алерты Watchdog"
    condition:
      labels:
        severity: "info"
        alertname: "Watchdog"
  - name: "Пропуск dev-кластера"
    condition:
      labels:
        cluster: "dev-cluster"
```

#### Исключение по значению метки (not_labels)

Игнорировать алерт, если метка имеет определённое значение. Например, пропускать всё, что **не** является `critical`:

```yaml
ignore_rules:
  - name: "Анализировать только critical"
    condition:
      not_labels:
        severity: "warning"
```

#### OR-логика (any)

Игнорировать, если выполняется **хотя бы одно** из условий:

```yaml
ignore_rules:
  - name: "Пропуск некритичных окружений"
    condition:
      any:
        - labels:
            cluster: "dev-cluster"
        - labels:
            cluster: "staging-cluster"
        - labels:
            severity: "info"
```

#### AND-логика (all)

Игнорировать только если выполняются **все** условия одновременно (тонкая настройка):

```yaml
ignore_rules:
  - name: "Пропуск только warning в staging"
    condition:
      all:
        - labels:
            cluster: "staging-cluster"
        - labels:
            severity: "warning"
```

> [!TIP]
> Условия `labels`, `not_labels`, `any`, `all` можно комбинировать внутри одного правила для создания сложных фильтров.
