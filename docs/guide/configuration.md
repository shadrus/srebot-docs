# Конфигурация SREBot (Helm / Env)

Настройки SREBot агента можно задавать с помощью **переменных окружения (Env Vars)** или через конфигурационный файл **`config.yml`** (который Helm-чарт монтирует внутрь пода). В данной статье описаны все доступные параметры.

## Базовые настройки подключения

| Переменная            | Описание                                                                                            | По умолчанию                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`  | Токен бота от @BotFather. **Примечание:** Допустим только один активный инстанс бота на один токен. | `""`                                                 |
| `TELEGRAM_CHANNEL_ID` | Идентификатор целевого Telegram-чата/канала.                                                        | `0`                                                  |
| `SLACK_BOT_TOKEN`     | Bot User OAuth Token Slack-приложения (`xoxb-...`).                                                 | `""`                                                 |
| `SLACK_APP_TOKEN`     | App-Level Token для Socket Mode (`xapp-...`).                                                       | `""`                                                 |
| `SLACK_CHANNEL_ID`    | ID Slack-канала, который бот будет слушать.                                                         | `""`                                                 |
| `DISCORD_BOT_TOKEN`   | Токен Discord-бота из Developer Portal.                                                             | `""`                                                 |
| `DISCORD_CHANNEL_ID`  | ID Discord-канала (Snowflake), где бот будет слушать алерты.                                        | `0`                                                  |
| `TIME_BASE_URL`       | Базовый URL сервера Time без `/api/v4`, например `https://time.example.com`.                        | `""`                                                 |
| `TIME_TOKEN`          | Bearer-токен учетной записи бота Time.                                                              | `""`                                                 |
| `TIME_CHANNEL_ID`     | Строковый ID канала Time, где бот будет слушать алерты.                                             | `""`                                                 |
| `SAAS_AGENT_TOKEN`    | Секретный токен для связи с SREBot Дашбордом.                                                       | `""`                                                 |
| `SAAS_WS_URL`         | WebSocket URL бэкенда платформы.                                                                    | `wss://api.srebot.site360.tech/api/v1/agent/connect` |
| `REDIS_URL`           | URL подключения к Redis для дедупликации алертов.                                                   | `redis://localhost:6379/0`                           |

Настройте учетные данные ровно одной чат-платформы. Если одновременно заполнены параметры
нескольких интеграций, SREBot завершит запуск с ошибкой. Инструкция для Time приведена на странице
[Настройка интеграции с Time Messenger](/guide/time-setup).

## HTTP-прокси {#http-proxy}

Все четыре чат-интеграции поддерживают `HTTPS_PROXY` в окружении процесса бота:

| Платформа      | Подключения через прокси                                     |
| -------------- | ------------------------------------------------------------ |
| Telegram       | Bot API: отправка сообщений и получение обновлений (polling) |
| Slack          | Web API и WebSocket для Socket Mode                          |
| Discord        | REST API, WebSocket gateway и загрузка вложений              |
| Time Messenger | REST API по HTTPS и WebSocket для получения событий          |

Прокси должен разрешать HTTP CONNECT к HTTPS/WSS-адресам чат-сервиса.
Префикс `http://` описывает подключение к прокси, хотя переменная называется `HTTPS_PROXY`:

```dotenv
HTTPS_PROXY=http://proxy.example.com:3128
```

### Docker Compose

Добавьте переменную в `.env`. В поставляемом с ботом `docker-compose.yml` этот файл
передаётся контейнеру через `env_file: .env`. Затем пересоздайте контейнер бота:

```bash
docker compose up -d --force-recreate bot
```

Сам по себе файл `.env` не передаёт все переменные контейнеру: в собственном Compose-файле
нужен `env_file` или соответствующая запись в `environment`.

### Kubernetes и локальный запуск

В Kubernetes передайте переменную в окружение **контейнера бота**. Например, фрагмент
описания контейнера в Deployment:

```yaml
env:
  - name: HTTPS_PROXY
    value: "http://proxy.example.com:3128"
```

При использовании Helm настройте окружение контейнера средствами вашего чарта.
Прокси не является параметром `config.yml`: запись в секции `config` сама по себе
не экспортирует переменную для сетевых SDK.

При локальном запуске экспортируйте переменную перед запуском бота:

```bash
export HTTPS_PROXY='http://proxy.example.com:3128'
uv run python -m srebot.bot.main
```

Чтение `.env` в настройки приложения также не экспортирует переменные в окружение SDK.

### Авторизация и исключения

Для прокси с Basic-аутентификацией используйте
`http://user:password@proxy.example.com:3128`. Текущая библиотека WebSocket Time
не декодирует percent-encoded логины и пароли прокси; используйте учётные данные,
которые не требуют такого кодирования в URL.

`NO_PROXY` позволяет исключать адреса из проксирования, но поведение зависит от SDK:

| Платформа      | Поведение `NO_PROXY`                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| Telegram       | Учитывается HTTPX для API и polling                                            |
| Slack          | SDK не применяет `NO_PROXY`                                                    |
| Discord        | Проверяется для `discord.com`; маршрут также используется gateway и вложениями |
| Time Messenger | REST проверяет `TIME_BASE_URL`; WebSocket применяет правила своей библиотеки   |

Для Time с `TIME_BASE_URL=http://...` REST использует `HTTP_PROXY`, а не `HTTPS_PROXY`.
Переменные прокси действуют на весь процесс: другие HTTP/WebSocket-клиенты бота тоже
могут их учитывать.

### Если прокси не задан

Без переменных прокси в окружении бот подключается напрямую. Отсутствие `HTTPS_PROXY`
в `.env` не отменяет значение, заданное в shell, контейнере или Pod. SDK также могут
учитывать `https_proxy`, `HTTP_PROXY`, `ALL_PROXY` и другие переменные прокси.
Для прямого подключения удалите применимые переменные из окружения запуска и
перезапустите процесс; в Docker Compose пересоздайте контейнер.

## Поведение AI (LLM) и парсера

| Переменная               | Описание                                                                                                                                                                   | По умолчанию  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `LLM_RESPONSE_LANGUAGE`  | Язык ответа RCA-отчета. Например: `Russian`, `English`.                                                                                                                    | `English`     |
| `AUTO_ANALYZE_ALERTS`    | Выполнять ли автоматический анализ приходящих алертов. Если `false`, бот пришлет короткое уведомление без запуска LLM. Анализ запустится только по явному запросу (Reply). | `true`        |
| `ALERT_FINGERPRINT_TTL`  | Время жизни алерта в кэше (в секундах). Если аналогичный алерт придет до истечения таймера, он будет проигнорирован.                                                       | `86400` (24ч) |
| `FOLLOWUP_MAX_TURNS`     | Максимальное количество уточняющих вопросов на один инцидент.                                                                                                              | `5`           |
| `FOLLOWUP_TTL`           | Время жизни контекста уточняющих вопросов (в секундах). После истечения бот не сможет ответить на follow-up.                                                               | `43200` (12ч) |
| `FOLLOWUP_USER_COOLDOWN` | Минимальная пауза (в секундах) между уточняющими вопросами от одного пользователя.                                                                                         | `10`          |
| `BOT_CONTAINER_NAME`     | Имя контейнера самого бота, чтобы он случайно не читал собственные логи из Elasticsearch.                                                                                  | `srebot`      |

## Системные флаги

- `LOG_LEVEL`: Уровень логирования бота (`DEBUG`, `INFO`, `WARNING`, `ERROR`). По умолчанию `INFO`.
- `DRY_RUN`: Если `True`, бот проведет анализ, выведет текст в логи контейнера, но **не будет отправлять сообщение** в чат. Удобно для локального дебага.

---

## Добавочная конфигурация (`config.yml` / Helm `values.yaml`)

Кроме плоских переменных, бот поддерживает богатую структуру в виде YAML, которая используется для продвинутых фильтров и интеграций:

### 1. Интеграция MCP-серверов (Model Context Protocol)

Через секцию `mcp_servers` вы можете подключать внешние инструменты (Prometheus, Elasticsearch, Kubernetes, внутренние API) прямо в логику AI-агента.

Начиная с версии 0.1.0, SREBot использует сетевое подключение к MCP-серверам (sidecars или отдельные контейнеры) вместо запуска локальных дочерних процессов. Это повышает безопасность и упрощает развертывание в Kubernetes.

Каждый сервер поддерживает следующие поля:

| Поле        | Описание                                                                                                                               | По умолчанию |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `url`       | SSE или HTTP эндпоинт MCP-сервера.                                                                                                     | `""`         |
| `transport` | Протокол связи: `sse` (legacy SSE) или `http` (modern Streamable HTTP).                                                                | `sse`        |
| `read_only` | Если `true`, бот скрывает от LLM все инструменты с мутирующими операциями (`create_`, `delete_` и т.д.). Рекомендуется для баз данных. | `false`      |
| `pool_size` | Количество параллельных MCP-соединений к серверу. Подробнее — в совете ниже.                                                           | `2`          |
| `condition` | Фильтр по labels. Если задан, сервер используется только для подходящих алертов.                                                       | `null`       |

**Пример (SSE):**
Серверы Prometheus часто используют классический SSE транспорт.

```yaml
mcp_servers:
  prometheus:
    url: "http://prometheus-mcp:8080/sse"
    transport: "sse"
```

**Пример (Streamable HTTP):**
Официальный MCP-сервер Elasticsearch использует современный протокол Streamable HTTP.

```yaml
mcp_servers:
  elasticsearch:
    url: "http://elasticsearch-mcp:18001/mcp"
    transport: "http"
    read_only: true
```

> [!TIP]
> **Параллельные соединения (`pool_size`):**
> Для каждого MCP-сервера бот открывает пул из `pool_size` независимых соединений (по умолчанию `2`, максимум `32`). Если AI-агент одновременно
> вызывает несколько инструментов одного сервера, запросы распределяются по пулу и выполняются параллельно, а не выстраиваются в очередь.
> Увеличивайте значение, если сервер поддерживает конкурентные сессии и вы замечаете задержки при массовых вызовах инструментов.

#### Развертывание через Sidecar (Helm)

В Kubernetes самый надежный способ запуска MCP-серверов — это **sidecar-контейнеры** внутри того же Pod'а, где запущен SREBot. Это гарантирует минимальную задержку и максимальную безопасность (трафик не покидает пределы Pod'а).

> [!WARNING]
> **Ключ верхнего уровня:** Секция `sidecars` должна быть корнем в вашем `values.yaml`. **НЕ** вкладывайте её внутрь секции `config`.
> **Синтаксис:** Kubernetes использует **список** для переменных окружения (`- name: ... / value: ...`), в то время как Docker Compose использует словарь.

1. **Настройте `values.yaml`**: Добавьте сервера в секцию `sidecars`.

```yaml
# Правильная структура values.yaml
config:
  agentToken: "..."

# sidecars находится на том же уровне, что и config, а не внутри!
sidecars:
  prometheus-mcp:
    image: ghcr.io/pab1it0/prometheus-mcp-server:latest
    env:
      - name: PROMETHEUS_URL
        value: "http://kube-prometheus-stack-prometheus.prometheus-stack:9090"
      - name: PROMETHEUS_MCP_BIND_PORT
        value: "18000"
      - name: PROMETHEUS_MCP_SERVER_TRANSPORT
        value: "sse"
    ports:
      - containerPort: 18000

  elasticsearch-mcp:
    image: docker.elastic.co/mcp/elasticsearch:latest
    # В Kubernetes используем args, чтобы дополнить ENTRYPOINT образа
    args: ["http", "--address", "0.0.0.0:18001"]
    env:
      - name: ES_URL
        value: "http://elasticsearch-master.elk:9200"
    ports:
      - containerPort: 18001
```

> [!CAUTION]
> **Command vs Args:** В отличие от Docker Compose, где `command` дополняет `ENTRYPOINT`, в Kubernetes `command` заменяет его полностью. Для официального образа Elasticsearch используйте `args`.

2. **Настройте `config` в `values.yaml`**: Укажите `localhost` в качестве адреса, так как все контейнеры в одном Под'е делят общую сеть.

```yaml
config:
  mcp_servers:
    prometheus:
      url: "http://localhost:18000/sse"
      transport: "sse"
      read_only: true

    elasticsearch:
      url: "http://localhost:18001/mcp"
      transport: "http"
      read_only: true
```

> [!TIP]
> **Сетевое взаимодействие в Docker (Linux):**
> Если ваши MCP-серверы запущены как Sidecar или отдельные контейнеры на той же машине, что и бот — используйте `http://host.docker.internal:PORT` для подключения.
>
> Для Linux не забудьте добавить `extra_hosts: ["host.docker.internal:host-gateway"]` в ваш `docker-compose.yml`. Кроме того, вы можете запустить MCP-контейнеры с `network_mode: host`, чтобы обращаться к сервисам хоста напрямую через `localhost`.

**Пример с несколькими кластерами (condition):**

Если в вашей инфраструктуре несколько Kubernetes-кластеров с разными Prometheus — можно привязать каждый MCP-сервер к своему кластеру через `condition`. LLM-агент автоматически получит инструменты только для кластера из пришедшего алерта.

```yaml
mcp_servers:
  prod-prometheus:
    url: "http://prod-prom-mcp:8080/sse"
    condition:
      labels:
        cluster: "prod-cluster"
  staging-prometheus:
    url: "http://staging-prom-mcp:8181/sse"
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
