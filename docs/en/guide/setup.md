# Getting Started (Helm Deployment)

SREBot is engineered natively for Kubernetes environments. The entire platform, including the automated Telegram AI agent, deploys directly into your private cluster via **Helm**, guaranteeing your observability databases (Prometheus/Elasticsearch) remain internal and strictly secure.

## Step 1: Provisions and Tokens

Collect the following structural attributes before performing your deployment workflow:

1. **Dashboard Agent Token:** 
   - Sign up at the secure [Web Dashboard](/#).
   - Route to **Settings** and generate a new `Agent Token`. Safely copy it.
   - Routinely verify your **Billing** status to ensure operations aren't halted by empty limits.
2. **Telegram Bot Token:**
   - Request a standard HTTP API token via Telegram's [@BotFather](https://t.me/botfather).
3. **Target Chat ID:**
   - Retrieve the specific numeric Chat ID representing your incident alert channel (e.g., `-100123456789`). This specifies where Alertmanager emits notifications.

## Step 2: Deploying the Helm Chart

SREBot supplies a standardized Helm Chart specifically wrapping the operational listener logic.

1. Add the remote SREBot registry:
```bash
helm repo add srebot https://shadrus.github.io/ai-abservability-bot
helm repo update
```

2. Construct a personalized `values.yaml` mapping your specific target credentials and internal database paths.

```yaml
config:
  agentToken: "YOUR_DASHBOARD_AGENT_TOKEN"
  telegramBotToken: "YOUR_BOTFATHER_TOKEN"
  telegramChatId: "-100123456789"

targets:
  prometheus:
    url: "http://prometheus-server.monitoring.svc.cluster.local:9090"
  elasticsearch:
    url: "http://elasticsearch-master.logging.svc.cluster.local:9200"
```

3. Execute the target chart deployment:

```bash
helm install srebot-agent srebot/ai-observability-bot -f values.yaml --namespace monitoring
```

## How Initializer Flow Functions

As soon as the fundamental Kubernetes deployments switch to a `Running` readiness state, **the bot independently routes registration behaviors**:
1. Utilizing the securely injected settings, the bot daemon authenticates its endpoint via the Telegram API against your designated `telegramChatId`.
2. It actively triggers listener pipelines for the chat without manual interaction tasks.
3. Incident polling strictly leverages internal `cluster.local` DNS lookups against the mapped PromQL engine to retain a zero-trust network surface.

::: tip Fully Operational
Simply add your new Telegram bot directly into your indicated incident group chat. The bot will automatically assume responsibility whenever Alertmanager emits its subsequent alerts.
:::
