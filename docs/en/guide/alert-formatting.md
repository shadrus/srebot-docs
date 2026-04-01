# Alert Formatting Recommendations

SREBot implements a **hybrid parsing strategy**: it first attempts fast, local Regex parsing and falls back to **Smart Parsing via LLM** (on the backend) if regex fails. To ensure optimal performance and cost-efficiency, it is best to follow recommended formatting templates.

---

## 🚀 Recommended Templates

### 1. Standard (Fastest)
This format is processed locally using high-performance regex matching. It's ideal for high-volume alerting.

**Example:**
```text
🚨 Alerts Firing:

Labels:
 - alertname = CPUUsageHigh
 - cluster = yandex-production
 - severity = critical
 - namespace = default
Annotations:
 - summary = CPU usage is above 90%
Source: http://prometheus/graph
```

### 2. Markdown/Bold (Slack/Telegram optimized)
SREBot also supports common bold formatting styles from Slack or Telegram.

**Example:**
```text
🔥 [FIRING:1] KubePodNotReady
*Alert:* Pod has been non-ready for more than 15 minutes.
*Details:*
 • *alertname:* `KubePodNotReady`
 • *cluster:* `yandex-production`
 • *namespace:* `canton`
 • *severity:* `warning`

*Annotations:*
 • *summary:* Pod validator-app is failing
Source: http://alertmanager/details
```

---

## 🔍 Essential Labels

For the AI analysis to work correctly, the following labels are mandatory:

| Label | Description |
| :--- | :--- |
| `alertname` | Unique identifier for the alert. Used for incident history tracking. |
| `cluster` | Cluster name. **MUST** match the key in `config.yml` for tool (Prometheus/Elastic) execution. |
| `severity` | Severity level (critical, warning, info). |
| `namespace` | (Optional but recommended) Helps the AI narrow down log and metric searches. |

---

## 🛠 Smart Fallback Parsing

If your template is highly custom (e.g., "Our production environment in cluster X is down"), the bot will automatically use the **Smart Parsing** fallback on the backend.

> [!NOTE]
> Smart Parsing consumes your organization's tokens and is logged centrally on the backend. We recommend using standard templates for automated system alerts and reserving Smart Parsing for manual messages or irregular alerts.

---

## 💡 Troubleshooting and Tips
1. **Always use `cluster`**: Without a cluster label, the AI will not know which Prometheus or Elasticsearch to query, making deeper diagnostics (MCP) impossible.
2. **Clear Headers**: Use distinct headers for status detection. Emotion icons (🚨/🔥 for Firing, ✅ for Resolved) at the start of the message help the bot identify status.
3. **Include Source URL**: A `Source:` URL at the bottom allows both the bot and users to quickly jump into the monitoring interface.
