# Быстрый старт (Deploy через Helm)

Установка SREBot ориентирована на Kubernetes-инфраструктуру. Деплой платформы, включая Telegram-бота, осуществляется с помощью **Helm**, что гарантирует изолированную и безопасную работу AI-агента внутри вашей приватной сети.

## Шаг 1: Подготовка аккаунта и Токенов

Перед деплоем вам потребуется собрать несколько токенов и ID:

1. **Agent Token:**
   - Зарегистрируйтесь в [Веб-дашборде](/#).
   - В разделе **Настройки** сгенерируйте и скопируйте ваш `Agent Token`.
   - Проверьте **Биллинг**, чтобы убедиться, что у вас положительный баланс (USD).
2. **Telegram Bot Token:**
   - Создайте бота в Telegram через [@BotFather](https://t.me/botfather). Скопируйте HTTP API токен.
3. **Telegram Chat ID:**
   - Узнайте ID вашего группового чата (инцидент-канала), куда приходит рассылка Alertmanager и куда вы собираетесь добавить бота. (Например, `-100123456789`).

## Шаг 2: Установка Helm Chart

SREBot имеет готовый Helm Chart для удобного развертывания в кластере.

1. Добавьте репозиторий SREBot:

```bash
helm repo add srebot https://shadrus.github.io/srebot
helm repo update
```

2. Подготовьте файл `values.yaml`, передав в него переменные из Шага 1, а также внутренние адреса вашей инфраструктуры:

```yaml
config:
  agentToken: "ВАШ_AGENT_TOKEN_ИЗ_ДАШБОРДА"
  telegramBotToken: "ТОКЕН_ОТ_BOTFATHER"
  telegramChatId: "-100123456789"

  mcp_servers:
    prometheus:
      url: "http://localhost:18000/sse"
      transport: "sse"
      read_only: true

    elasticsearch:
      url: "http://localhost:18001/mcp"
      transport: "http"
      read_only: true

sidecars:
  prometheus-mcp:
    image: ghcr.io/pab1it0/prometheus-mcp-server:latest
    env:
      - name: PROMETHEUS_URL
        value: "http://prometheus-server.monitoring.svc.cluster.local:9090"
      - name: PROMETHEUS_MCP_BIND_PORT
        value: "18000"
      - name: PROMETHEUS_MCP_SERVER_TRANSPORT
        value: "sse"
    ports:
      - containerPort: 18000

  elasticsearch-mcp:
    image: docker.elastic.co/mcp/elasticsearch:latest
    args: ["http", "--address", "0.0.0.0:18001"]
    env:
      - name: ES_URL
        value: "http://elasticsearch-master.logging.svc.cluster.local:9200"
    ports:
      - containerPort: 18001
```

3. Выполните установку (deployment):

```bash
helm install my-srebot srebot/srebot --namespace monitoring --create-namespace
```

## Как бот начнет работу?

Как только pod'ы успешно запустятся (статус `Running`), бот SREBot инициализируется. **Функции регистрации выполняются самим ботом:**

1. Он запустит процесс, благодаря которому автоматически авторизуется и привяжется к указанному `telegramChatId`.
2. Начнет слушать поток оповещений (Alertmanager) в этом чате.
3. Будет запрашивать данные через MCP-серверы (Prometheus, Elasticsearch) внутри вашего кластера и отправлять результаты расследования прямо в чат без необходимости открывать внешний доступ (Ingress).

::: tip Интеграция завершена
Просто добавьте вашего Telegram бота (из BotFather) в целевой инцидент-чат. Бот начнет работу самостоятельно при первом сработавшем инциденте.
:::
