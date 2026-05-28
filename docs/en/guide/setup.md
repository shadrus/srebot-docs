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
helm repo add srebot https://shadrus.github.io/srebot
helm repo update
```

2. Construct a personalized `values.yaml` mapping your specific target credentials and internal database paths.

```yaml
config:
  agentToken: "YOUR_DASHBOARD_AGENT_TOKEN"
  telegramBotToken: "YOUR_BOTFATHER_TOKEN"
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

3. Execute the target chart deployment:

```bash
helm install my-srebot srebot/srebot --namespace monitoring --create-namespace
```

## How Initializer Flow Functions

As soon as the pods are running, SREBot initializes automatically. **The bot handles registration on its own:**

1. It authenticates and binds to the specified `telegramChatId` via the Telegram API.
2. It begins listening for Alertmanager notifications in the chat.
3. It queries data through MCP servers (Prometheus, Elasticsearch) inside your cluster and sends investigation results directly to the chat — no external access (Ingress) required.

::: tip Fully Operational
Simply add your new Telegram bot directly into your indicated incident group chat. The bot will automatically assume responsibility whenever Alertmanager emits its subsequent alerts.
:::
