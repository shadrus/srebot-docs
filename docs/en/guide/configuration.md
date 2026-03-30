# SREBot Configuration (Helm / Env)

SREBot agent settings can be specified using **Environment Variables (Env Vars)** or via a **`config.yml`** configuration file (which the Helm chart inherently mounts inside the pod interface). This article describes all available parameters.

## Core Connectivity Settings

| Variable | Description | Default |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Provided by @BotFather. | `""` |
| `TELEGRAM_CHANNEL_ID` | Telegram Chat ID designating the incident channel. | `0` |
| `SAAS_AGENT_TOKEN` | Secure token linking the agent to your SREBot Dashboard. | `""` |
| `SAAS_WS_URL` | Polling WebSocket URL for the SREBot SaaS backend. | `ws://localhost:8000/api/v1/agent/connect` |
| `REDIS_URL` | Redis standalone connection string to power deduplication. | `redis://localhost:6379/0` |

## AI Logic (LLM) & Deduplication Configuration

| Variable | Description | Default |
|---|---|---|
| `LLM_RESPONSE_LANGUAGE` | Final output RCA language mapping. e.g., `Russian`, `English`. | `English` |
| `LLM_MAX_ITERATIONS` | System limit restricting infinite tool-call loops by the AI. | `10` |
| `ALERT_FINGERPRINT_TTL` | Lifecycle TTL (in seconds). Firing alerts mapping identical fingerprint strings natively condense into single parent trees prior to expiration. | `86400` (24h) |
| `BOT_CONTAINER_NAME` | SREBot pod internal container label (forces isolation against reading its own logs inside Elasticsearch). | `ai-observability-bot` |

## Advanced YAML Bindings (`config.yml` / Helm `values.yaml`)

Beyond environment variables, SREBot supports elaborate multi-level object overrides dedicated towards complex integrations.

### 1. Integrating MCP Servers (Model Context Protocol)

Specify backend tools globally directly parsing JSON RPC logic into your AI using the `mcp_servers` node.

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

### 2. Alert Ignore Rules

Defines hardcoded exclusions directly dropping targeted alerts to optimize token allocation without blocking Alertmanager routines.

```yaml
ignore_rules:
  - name: "Drop diagnostic spam"
    condition:
      labels:
        severity: "info"
        alertname: "Watchdog"
  - name: "Ignore low-priority dev nodes"
    condition:
      labels:
        cluster: "dev-cluster"
```

## System Flags
- `LOG_LEVEL`: Adjust the internal verbosity standard (`DEBUG`, `INFO`, `WARNING`, `ERROR`). Base default is `INFO`.
- `DRY_RUN`: Assuming `True`, SREBot will execute thorough system diagnostics dumping output strictly into K8s Pod logs instead of broadcasting directly to your active Telegram channels. Suitable for pre-flight testing.
