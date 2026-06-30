# Bot Skills

Skills are customizable text instructions (in Markdown format) that allow you to adapt the behavior of the SREBot LLM agent to the specifics of your organization's infrastructure without modifying the bot's code.

## Why are Skills needed?

By default, SREBot uses general log and metric analysis algorithms. However, in real-world projects, the infrastructure often has unique characteristics:
- Specific logging formats (e.g., the application name is in a nested field like `json.appname` or `json.app_name`, rather than `app_name`).
- Non-standard metric locations or custom PromQL queries.
- Custom links to internal logging systems (Kibana, Loki) or internal wiki documentation.

Skills allow you to pass this knowledge to the model when investigating incidents.

---

## Creating a Skill

To create a skill, navigate to the **Skills** section in the dashboard's sidebar and click the **Create Skill** button.

The skill creation form consists of the following fields:

### 1. Metadata
- **Name:** A descriptive name for the skill (e.g., `Log Parsing Rules for worker-billing`).
- **Description:** A brief summary of the skill's purpose.

### 2. Scope
Determines which agents these instructions will apply to:
- **Organization:** Instructions will apply to all bots within your organization.
- **Specific Bot:** Instructions are bound only to the selected bots.

### 3. Trigger Rules
Allows you to automatically activate the skill only for specific alerts. You can specify a set of rules in `Key: Regex` format:
- For example: `namespace: production`, `alertname: OOMKilled`.
- If no trigger rules are specified, the skill acts as a **catch-all** and applies to all incidents in the selected scope.

### 4. Markdown Instructions
Free-form text in Markdown format describing the rules and context. This text is dynamically appended to the LLM model's system prompt.

---

## How It Works

Upon receiving a new alert, the SREBot backend automatically performs the following steps:
1. **Metadata Extraction:** All labels and annotations are extracted from the incoming alert.
2. **Trigger Matching:** Trigger rules for all active skills of the organization are evaluated using regular expressions.
3. **Priority Sorting:** All matching skills are sorted by scope: first **Global**, then **Organization-wide**, and finally **Bot-specific**. Bot-specific instructions have the highest priority since they are placed at the end of the system prompt.
4. **Prompt Injection:** The compiled block of instructions is injected into the LLM system message before starting the analysis loop.
