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
- *“Show logs for the last 10 minutes from this node”*
- *“What was the CPU usage at the time of the alert?”*
- *“What other alerts triggered in this cluster within the hour?”*

**Off-topic Protection:**
If you ask the bot about something unrelated to the incident (e.g., *“tell a joke”* or *“how are you”*), the bot will politely refuse to answer to save your organization's token balance.

### 2. Communication Language
The bot can communicate in different languages. The response language is configured in the control panel or via the `LLM_RESPONSE_LANGUAGE` environment variable.
If you want the bot to respond in Russian, make sure this parameter is set to `Russian`.

### 3. Constraints (Limits)
To protect against infinite loops and spam, the following limits apply:
- **Cooldown**: there must be a pause between questions from the same user (default is 5 seconds).
- **Maximum turns**: a limited number of questions can be asked per incident (default is 5). If the limit is exceeded, the bot will notify you.

These parameters are configured on the bot side (`FOLLOWUP_COOLDOWN`, `FOLLOWUP_MAX_TURNS`).
