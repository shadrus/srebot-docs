# Interactive Web Dashboard

[SREBot Web Dashboard](https://srebot.site360.tech) acts as your platform's primary control center. Aside from administering security options and configuration, it enables rigorous tracing of SREBot's operational logic per incident.

## Incident Analysis Detail View

SREBot excels by exposing complete transparency (its "thought process") into the LLM executions. Over on your summary view, colored severity indicators delineate priority issues.

Clicking an incident drills down into the **Detailed RCA Record**, showcasing:

- **Processing State:** Processing state (`analyzing`), finished state (`completed`), or errored (`failed`).
- **Written RCA Output:** The finalized, comprehensive issue breakdown provided to Telegram.
- **LLM Tool Executions (Logs):** You can transparently observe the step-by-step PromQL interactions or Elasticsearch DSL requests made by SREBot.

This allows analysts to sanity-test the decisions directly (averting hallucinations) while repurposing verified PromQL snippets immediately into standard Grafana charts.

## Token Billing System

SREBot utilizes a flexible **token-based** pricing foundation covering the backend LLM orchestrator costs.

- **Rates:** Expenses scale per every `1 Million` tokens ingested (`input`) or returned (`output`). Base pricing relies on your organization's active **Billing Tariff**.
- **Usage Allocations:** Allocations deplete from your USD balance. Charges apply asynchronously after every fully finalized RCA pipeline run.
- **Auditing Logs:** Visualized billing charts present clear expenditure lines, accompanied by robust transaction logs reporting standard TopUps and granular USAGE deductions.
- **Adding Funds:** Various gateways natively orchestrate frictionless account funding—such as Robokassa logic and native Gift mechanisms.

::: danger Blocking Behaviors
Should your organizational account drop below `0.0`, SREBot freezes analysis requests. A designated push alert directly notifies your Telegram chat specifying the underlying balance requirement—analysis won't run.
:::

## Security & Organization Settings

- **Identity Management:** Access encompasses secure JWT workflows, alongside email-driven token resets.
- Role boundaries secure the organization against unexpected edits.
