# Конфигурация SREBot (Helm / Env)

Настройки SREBot агента (Telegram бота) можно задавать с помощью **переменных окружения (Env Vars)** или через конфигурационный файл **`config.yml`** (который Helm-чарт монтирует внутрь пода). В данной статье описаны все доступные параметры.

## Базовые настройки подключения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather. | `""` |
| `TELEGRAM_CHANNEL_ID` | Идентификатор целевого чата/канала для рассылки. | `0` |
| `SAAS_AGENT_TOKEN` | Секретный токен для связи с SREBot Дашбордом. | `""` |
| `SAAS_WS_URL` | WebSocket URL бэкенда платформы. | `ws://localhost:8000/api/v1/agent/connect` |
| `REDIS_URL` | URL подключения к Redis для дедупликации алертов. | `redis://localhost:6379/0` |

## Поведение AI (LLM) и парсера

| Переменная | Описание | По умолчанию |
|---|---|---|
| `LLM_RESPONSE_LANGUAGE` | Язык ответа RCA-отчета. Например: `Russian`, `English`. | `English` |
| `LLM_MAX_ITERATIONS` | Максимальное число шагов (использования тулзов) на один алерт. | `10` |
| `ALERT_FINGERPRINT_TTL` | Время жизни алерта в кэше (в секундах). Если аналогичный алерт придет до истечения таймера, он будет проигнорирован (сгруппирован). | `86400` (24ч) |
| `BOT_CONTAINER_NAME` | Имя контейнера самого бота, чтобы он случайно не читал собственные логи из Elasticsearch. | `ai-observability-bot` |

## Добавочная конфигурация (`config.yml` / Helm `values.yaml`)

Кроме плоских переменных, бот поддерживает богатую структуру в виде YAML, которая используется для продвинутых фильтров и интеграций:

### 1. Интеграция MCP-серверов (Model Context Protocol)

Через секцию `mcp_servers` вы можете прокидывать любые внешние инструменты (интеграция с Kubernetes, БД или внутренними API) прямо в логику вашего AI-агента.

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

### 2. Правила игнорирования алертов (Ignore Rules)

Определяет список условий, при которых бот должен полностью игнорировать тревогу и не тратить токены на AI анализ.

```yaml
ignore_rules:
  - name: "Игнорировать тестовые алерты"
    condition:
      labels:
        severity: "info"
        alertname: "Watchdog"
  - name: "Пропуск dev кластеров"
    condition:
      labels:
        cluster: "dev-cluster"
```

## Системные флаги
- `LOG_LEVEL`: Уровень логирования бота (`DEBUG`, `INFO`, `WARNING`, `ERROR`). По умолчанию `INFO`.
- `DRY_RUN`: Если `True`, бот проведет анализ, выведет текст в логи контейнера, но **не будет отправлять сообщение** в Telegram чат. Удобно для локального дебага.
