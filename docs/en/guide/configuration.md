# SREBot Configuration (Helm / Env)

The SREBot agent can be configured using **environment variables** or via a **`config.yml`** configuration file (which the Helm chart mounts inside the pod). This article describes all available parameters.

## Core Connection Settings

| Variable | Description | Default |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather. | `""` |
| `TELEGRAM_CHANNEL_ID` | Telegram target chat/channel ID. | `0` |
| `SLACK_BOT_TOKEN` | Slack App Bot User OAuth Token (`xoxb-...`). | `""` |
| `SLACK_APP_TOKEN` | Slack App Token for Socket Mode (`xapp-...`). | `""` |
| `SLACK_CHANNEL_ID` | Specific Slack channel ID to monitor. | `""` |
| `SAAS_AGENT_TOKEN` | Secret token for SREBot Dashboard communication. | `""` |
| `SAAS_WS_URL` | WebSocket URL for the platform backend. | `wss://api.srebot.site360.tech/api/v1/agent/connect` |
| `REDIS_URL` | Redis connection URL for alert deduplication. | `redis://localhost:6379/0` |

## AI (LLM) and Parser Behavior

| Variable | Description | Default |
|---|---|---|
| `LLM_RESPONSE_LANGUAGE` | Language of the RCA report. Example: `Russian`, `English`. | `English` |
| `LLM_MAX_ITERATIONS` | Maximum steps (tool usages) per alert analysis. | `10` |
| `ALERT_FINGERPRINT_TTL` | Lifespan of an alert in cache (seconds). Identical alerts within this window are deduplicated. | `86400` (24h) |
| `BOT_CONTAINER_NAME` | Name of the bot's own container (prevents it from reading and analyzing its own logs). | `ai-observability-bot` |

## System Flags

- `LOG_LEVEL`: Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). Defaults to `INFO`.
- `DRY_RUN`: If `True`, the bot performs the analysis and logs it but **does not send any messages** to the chat. Useful for local debugging.

---

## Extended Configuration (`config.yml` / Helm `values.yaml`)

In addition to environment variables, the bot supports a structured YAML format for advanced filters and integrations:

### 1. Model Context Protocol (MCP) Integration

The `mcp_servers` section allows you to connect external tools (Prometheus, Elasticsearch, Kubernetes, internal APIs) directly to the AI agent's logic.

Each server supports the following fields:

| Field | Description |
|---|---|
| `command` | Command to execute the MCP server. |
| `args` | Command-line arguments. |
| `env` | Environment variables passed to the server process. |
| `read_only` | If `true`, the bot hides all mutation tools (`create_`, `delete_`, `update_`, `bulk`, etc.) from the LLM. Recommended for Elasticsearch/Databases to prevent accidental data modification. |
| `condition` | Label filter. If specified, the server is only used for alerts matching the condition. Ideal for multi-cluster environments (see example below). |

**Basic Example:**
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

**Multi-Cluster Example (using condition):**

If your infrastructure has multiple Kubernetes clusters with separate Prometheus instances, you can bind each MCP server to its specific cluster. The AI agent will automatically receive only the tools relevant to the cluster specified in the incoming alert labels.

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
