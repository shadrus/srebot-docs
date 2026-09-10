# Getting Started (Helm Deployment)

SREBot is designed for Kubernetes environments. A bot for Telegram, Slack, Discord, or Time is
deployed into your private cluster with **Helm**, keeping your observability databases
(Prometheus/Elasticsearch) internal.

## Step 1: Provisions and Tokens

Collect the following structural attributes before performing your deployment workflow:

1. **Dashboard Agent Token:**
   - Sign up at the secure [Web Dashboard](/#).
   - Route to **Settings** and generate a new `Agent Token`. Safely copy it.
   - Routinely verify your **Billing** status to ensure operations aren't halted by empty limits.
2. **Chat platform credentials:**
   - Select one platform and prepare its tokens and channel ID.
   - For Telegram, follow the [Telegram setup guide](/en/guide/telegram-setup).
   - For Time, follow the [Time Messenger setup guide](/en/guide/time-setup).

One SREBot process can connect to only one chat platform.

If the chat service is accessed through an HTTP proxy, set `HTTPS_PROXY` in the bot
container's environment. See [HTTP Proxy](./configuration#http-proxy) for examples
and SDK limitations.

## Step 2: Deploying the Helm Chart

SREBot supplies a standardized Helm Chart specifically wrapping the operational listener logic.

1. Add the remote SREBot registry:

```bash
helm repo add srebot https://shadrus.github.io/srebot
helm repo update
```

2. Construct a personalized `values.yaml` mapping your specific target credentials and internal database paths.

```yaml
secrets:
  telegram_bot_token: "YOUR_BOTFATHER_TOKEN"
  telegram_channel_id: "-100123456789"
  saas_agent_token: "YOUR_DASHBOARD_AGENT_TOKEN"

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

For Time, replace the `secrets` section:

```yaml
secrets:
  time_base_url: "https://time.example.com"
  time_token: "YOUR_TIME_BOT_TOKEN"
  time_channel_id: "YOUR_TIME_CHANNEL_ID"
  saas_agent_token: "YOUR_DASHBOARD_AGENT_TOKEN"
```

3. Execute the target chart deployment:

```bash
helm install my-srebot srebot/srebot --namespace monitoring --create-namespace
```

## How Initializer Flow Functions

As soon as the pods are running, SREBot initializes automatically. **The bot handles registration on its own:**

1. It authenticates with the selected messenger and connects to the configured channel.
2. It begins listening for Alertmanager notifications in the chat.
3. It queries data through MCP servers (Prometheus, Elasticsearch) inside your cluster and sends investigation results directly to the chat — no external access (Ingress) required.

::: tip Fully Operational
Add the bot account to the target incident chat. The bot starts working when the first incident
notification arrives.
:::
