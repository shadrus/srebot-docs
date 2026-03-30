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

## Limits and Constraints

Please be aware:
If a matched alert notification triggers inside the channel, but your underlying organizational account remains at zero (`< 0.0`), SREBot forcibly bypasses workflow processing. The bot simply returns a generic fallback note advising personnel about the exhausted balance cap. Review further over at [Web Dashboard & Billing](/en/guide/dashboard).
