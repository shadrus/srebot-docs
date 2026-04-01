# Utilizing the Telegram Bot

The vast majority of SREBot interaction takes place straight within your shared or personal Telegram chat interfaces.

## Reading Chat Alerts

Instead of demanding complex routing networks or standalone endpoints, SREBot interfaces directly with your pre-established notifications. When your Alertmanager (or any active bot forwarding Prometheus state changes) outputs a message into the chat beginning with `🚨 Alerts Firing:`, SREBot naturally:
1. Translates the plaintext content line-by-line.
2. Identifies semantic **Labels** and **Annotations** embedded inside.
3. Parses structural metadata (`alertname`, `cluster`, `namespace`, `severity`) to log an active **Incident Record** directly within the backend.

Provided several messages hit the channel sequentially indicating identical failures (sharing the internal `fingerprint`), SREBot intuitively aggregates those updates to halt parallel duplicate analysis (safeguarding your team from alert fatigue and unnecessary token expenditures).

## Result Format (RCA Report)

As soon as the AI effectively processes and correlates data via Prometheus telemetry and Elasticsearch logs, SREBot emits the finalized deduction block. **The bot specifically uses the Reply function** against the original Alertmanager message, keeping conversational context rigidly intact.

<b style="font-size: 1.2em;">🔍 Root Cause Analysis</b>

<b>Alert:</b> CPUThrottlingHigh <br>
<b>Cluster:</b> `prod-cluster` | <b>Namespace:</b> `payment-service`

<b>📊 Findings:</b>
- Over the last trailing 15 minutes, sustained CPU utilization hit 99%.
- Searching Elasticsearch exposes rampant `OutOfMemory` issues and cascading GC failures.
- Connection polling toward the DB timed out routinely at 5-second limits.

<b>🔧 Likely Cause:</b>
Insufficient CPU limit allocations restricted the `payment-service` pod causing intense aggressive throttling. This drove cascading backend degradation and timeout limits against the local DB limits.

<b>💡 Recommended Actions:</b>
1. Expand the target `resources.limits.cpu` ceiling inside the corresponding Kubernetes Pod/Deployment definition.
2. Cycle the pod immediately to refresh limits.

---
*(Sample SREBot Telegram Reply)*

## Limits and Balance

Please note:
If your platform balance is zero (or below) at the time an alert triggers, the bot **will not** initiate analysis. You will receive a notification about insufficient balance, and the incident investigation will be cancelled. For more information on plans, see the [Dashboard and Billing](/en/guide/dashboard) section.

## Resolved Behavior

When Alertmanager sends a recovery message (`✅ Resolved`), the bot only responds if it has **already analyzed** that specific alert in the current session. In this case, the bot will post a `✅ Resolved: <alertname>` reply to the original message. If a resolved notification arrives without a prior firing state, it will be ignored quietly.

> [!NOTE]
> For security purposes, the bot automatically masks Bearer tokens, API keys, and passwords within diagnostic tool outputs before they reach the LLM. Your private credentials are never stored in the analysis history.
