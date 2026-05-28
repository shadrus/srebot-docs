# Communicating with the Bot and Interaction Rules

The SREBot platform allows you not only to receive automatic alert analysis (RCA) but also to dialogue with the bot in chat to clarify details.

## How to Ask a Follow-up Question

To ask the bot a question about a specific incident:

1. Find the bot's message with the analysis (RCA) in the Telegram channel or chat.
2. Reply to this message (**Reply**) with your question.
3. The bot will see your reply, show an "Analyzing..." status, and send the clarified information.

## Rules for Interacting with the Bot

To ensure the bot works efficiently and does not waste your tokens, please follow these rules:

### 1. Topic of Questions

The bot is designed as a professional SRE assistant. It responds **only to questions related to the current incident**, the provided analysis, or general diagnostics and observability tasks.

**Examples of good questions:**

- _“Show logs for the last 10 minutes from this node”_
- _“What was the CPU usage at the time of the alert?”_
- _“What other alerts triggered in this cluster within the hour?”_

**Off-topic Protection:**
If you ask the bot about something unrelated to the incident (e.g., _“tell a joke”_ or _“how are you”_), the bot will politely refuse to answer to save your organization's token balance.

### 2. Communication Language

The bot can communicate in different languages. The response language is configured in the control panel or via the `LLM_RESPONSE_LANGUAGE` environment variable.
If you want the bot to respond in Russian, make sure this parameter is set to `Russian`.

### 3. Constraints (Limits)

To protect against infinite loops and spam, the following limits apply:

- **Cooldown**: there must be a pause between questions from the same user (default is 10 seconds).
- **Maximum turns**: a limited number of questions can be asked per incident (default is 5). If the limit is exceeded, the bot will notify you.

These parameters are configured on the bot side (`FOLLOWUP_COOLDOWN`, `FOLLOWUP_MAX_TURNS`).

## Management Commands (Mute / Unmute / Status)

You can temporarily suspend alert analysis and notifications using management commands. Commands can be sent with or without a slash (`/`).

### 1. Suspend Notifications (Mute)

The command `mute [duration]` (or `/mute [duration]`) activates silence mode.

- **Duration format**: supports seconds (`s`), minutes (`m`), hours (`h`), and days (`d`). For example: `30m`, `2h`, `1d`, `1h 30m`.
- **Default duration**: if no duration is specified, silence mode is activated for **1 hour**.

It can be applied in two scopes:

- **Specific Alert Type (Mute Alert)**: Send the command `mute 2h` as a **reply** to the bot's analysis (RCA) message. The bot will silence only this specific alert type (e.g. `HighCpuUsage`) in the current chat.
- **Global Silence (Mute Chat)**: Send the command `mute 2h` as a regular message in the chat. The bot will temporarily stop analyzing all incoming alerts for this chat.

### 2. Resume Notifications (Unmute)

The command `unmute` (or `/unmute`) deactivates silence mode.

- **Resume Specific Alert Type**: Send `unmute` as a **reply** to the bot's analysis (RCA) message. The bot will resume analysis only for that specific alert type.
- **Global Resume**: Send `unmute` as a regular message in the chat. This will clear all active silences (both global and alert-specific) for the chat.

### 3. Check Silence Status (Status)

The command `status` (or `/status`) lists all active silence rules in the current chat, showing the remaining duration for each.

- If there are no active silences, the bot will respond confirming that it is running normally.

### 4. Targeting Specific Bots (Multi-bot Chats)

If you have multiple bots in the same group chat, you can target commands to a specific bot instance by appending its username suffix:

- `/mute@SreBotA 30m` — silences only `@SreBotA`.
- `/status@SreBotB` — queries status only from `@SreBotB`.

If no username suffix is provided, the command will be processed by all bots that can read chat messages.
