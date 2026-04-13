# SREBot Configuration (Helm / Env)

The SREBot agent can be configured using **environment variables** or via a **`config.yml`** configuration file (which the Helm chart mounts inside the pod). This article describes all available parameters.

## Core Connection Settings

| Variable              | Description                                                                             | Default                                              |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`  | Bot token from @BotFather. **Note:** Only one active bot instance per token is allowed. | `""`                                                 |
| `TELEGRAM_CHANNEL_ID` | Telegram target chat/channel ID.                                                        | `0`                                                  |
| `SLACK_BOT_TOKEN`     | Slack App Bot User OAuth Token (`xoxb-...`).                                            | `""`                                                 |
| `SLACK_APP_TOKEN`     | Slack App Token for Socket Mode (`xapp-...`).                                           | `""`                                                 |
| `SLACK_CHANNEL_ID`    | Specific Slack channel ID to monitor.                                                   | `""`                                                 |
| `DISCORD_BOT_TOKEN`   | Discord Bot Token from Developer Portal.                                                | `""`                                                 |
| `DISCORD_CHANNEL_ID`  | Discord Channel ID (Snowflake) where the bot listens for alerts.                        | `0`                                                  |
| `SAAS_AGENT_TOKEN`    | Secret token for SREBot Dashboard communication.                                        | `""`                                                 |
| `SAAS_WS_URL`         | WebSocket URL for the platform backend.                                                 | `wss://api.srebot.site360.tech/api/v1/agent/connect` |
| `REDIS_URL`           | Redis connection URL for alert deduplication.                                           | `redis://localhost:6379/0`                           |

## AI (LLM) and Parser Behavior

| Variable                | Description                                                                                    | Default       |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ------------- |
| `LLM_RESPONSE_LANGUAGE` | Language of the RCA report. Example: `Russian`, `English`.                                     | `English`     |
| `ALERT_FINGERPRINT_TTL` | Lifespan of an alert in cache (seconds). Identical alerts within this window are deduplicated. | `86400` (24h) |
| `BOT_CONTAINER_NAME`    | Name of the bot's own container (prevents it from reading and analyzing its own logs).         | `srebot`      |

## System Flags

- `LOG_LEVEL`: Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). Defaults to `INFO`.
- `DRY_RUN`: If `True`, the bot performs the analysis and logs it but **does not send any messages** to the chat. Useful for local debugging.

---

## Extended Configuration (`config.yml` / Helm `values.yaml`)

In addition to environment variables, the bot supports a structured YAML format for advanced filters and integrations:

### 1. Model Context Protocol (MCP) Integration

The `mcp_servers` section allows you to connect external tools (Prometheus, Elasticsearch, Kubernetes, internal APIs) directly to the AI agent's logic.

Starting from version 0.1.0, SREBot uses network-based connections to MCP servers (sidecars or standalone containers) instead of spawning local child processes.

Each server supports the following fields:

| Field       | Description                                                                              | Default |
| ----------- | ---------------------------------------------------------------------------------------- | ------- |
| `url`       | The SSE or HTTP endpoint of the MCP server.                                              | `""`    |
| `transport` | Communication protocol: `sse` (legacy SSE) or `http` (modern Streamable HTTP).           | `sse`   |
| `read_only` | If `true`, the bot hides all mutation tools from the LLM. Recommended for Elasticsearch. | `false` |
| `condition` | Label filter. If specified, the server is only used for alerts matching the condition.   | `null`  |

**Example (SSE):**

```yaml
mcp_servers:
  prometheus:
    url: "http://prometheus-mcp:8080/sse"
    transport: "sse"
```

**Example (Streamable HTTP):**

```yaml
mcp_servers:
  elasticsearch:
    url: "http://elasticsearch-mcp:18001/mcp"
    transport: "http"
    read_only: true
```

#### Deploying as Sidecars (Helm)

When running in Kubernetes, the most reliable way to deploy MCP servers is as **sidecar containers** within the same Pod as SREBot. This ensures low latency and high security (communication stays within the Pod).

> [!WARNING]
> **Top-level Key:** The `sidecars` section must be a **root** key in your `values.yaml`. Do **NOT** nest it inside the `config` section.
> **Syntax:** Kubernetes uses a **list** for environment variables (`- name: ... / value: ...`), while Docker Compose uses a dictionary.

1. **Update `values.yaml`**: Add your MCP servers to the `sidecars` section.

```yaml
# Correct values.yaml structure
config:
  agentToken: "..."

# sidecars is at the same level as config, not inside it!
sidecars:
  prometheus-mcp:
    image: ghcr.io/pab1it0/prometheus-mcp-server:latest
    env:
      - name: PROMETHEUS_URL
        value: "http://prometheus-operated.monitoring.svc:9090"
      - name: PROMETHEUS_MCP_SERVER_TRANSPORT
        value: "sse"
    ports:
      - containerPort: 8080

  elasticsearch-mcp:
    image: docker.elastic.co/mcp/elasticsearch:latest
    # In Kubernetes, use 'args' to append to the image's ENTRYPOINT
    args: ["http", "--address", "0.0.0.0:18001"]
    env:
      - name: ES_URL
        value: "http://elasticsearch-master:9200"
    ports:
      - containerPort: 8081
```

> [!CAUTION]
> **Command vs Args:** Unlike Docker Compose where `command` appends to `ENTRYPOINT`, in Kubernetes `command` overrides it entirely. Use `args` for the official Elasticsearch image.

2. **Update `config` in `values.yaml`**: Point SREBot to `localhost`, as all containers in a Pod share the same network namespace.

```yaml
config:
  mcp_servers:
    prometheus:
      url: "http://localhost:8080/sse"
    elasticsearch:
      url: "http://localhost:8081/mcp"
      transport: "http"
```

> [!TIP]
> **Docker Networking (Linux):**
> If your MCP servers are running as sidecars or containers on the same host as the bot, use `http://host.docker.internal:PORT` for connectivity.
>
> On Linux, ensure you have `extra_hosts: ["host.docker.internal:host-gateway"]` in your `docker-compose.yml`. Alternatively, run your MCP containers with `network_mode: host` to access host services directly via `localhost`.

**Multi-Cluster Example (using condition):**

If your infrastructure has multiple Kubernetes clusters with separate Prometheus instances, you can bind each MCP server to its specific cluster. The AI agent will automatically receive only the tools relevant to the cluster specified in the incoming alert labels.

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

### 2. Alert Filtering (Ignore Rules)

Define conditions under which the bot should completely ignore an alert to save tokens and reduce noise.

#### Simple Label Matching

Labels must match simultaneously (**AND** logic):

```yaml
ignore_rules:
  - name: "Ignore test Watchdog alerts"
    condition:
      labels:
        severity: "info"
        alertname: "Watchdog"
  - name: "Skip dev cluster"
    condition:
      labels:
        cluster: "dev-cluster"
```

#### Negative Matching (not_labels)

Ignore the alert if a label matches a specific value. For example, ignore anything that is **not** `critical`:

```yaml
ignore_rules:
  - name: "Analyze only critical"
    condition:
      not_labels:
        severity: "warning"
```

#### OR Logic (any)

Ignore if **at least one** condition is met:

```yaml
ignore_rules:
  - name: "Skip non-prod environments"
    condition:
      any:
        - labels:
            cluster: "dev-cluster"
        - labels:
            cluster: "staging-cluster"
        - labels:
            severity: "info"
```

#### AND Logic (all)

Ignore only if **all** conditions are met simultaneously (for granular control):

```yaml
ignore_rules:
  - name: "Skip only warnings in staging"
    condition:
      all:
        - labels:
            cluster: "staging-cluster"
        - labels:
            severity: "warning"
```

> [!TIP]
> You can combine `labels`, `not_labels`, `any`, and `all` within a single rule to create complex filtering logic.
