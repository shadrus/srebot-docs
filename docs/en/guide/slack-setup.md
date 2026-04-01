# Slack Integration Setup

SREBot integration with Slack allows it to watch channel messages, identify Alertmanager notifications, and perform automated AI analysis.

The bot operates in **Socket Mode**, which removes the need for public webhooks and lets you run the bot behind NAT or within a private network.

---

## 1. Creating a Slack App

1. Go to [Slack API: Your Apps](https://api.slack.com/apps).
2. Click **Create New App** -> **From scratch**.
3. Name your app (e.g., `SREBot`) and select your Workspace.

## 2. Enabling Socket Mode

1. In the sidebar, select **Settings -> Socket Mode**.
2. Toggle **Enable Socket Mode**.
3. Slack will prompt you to create an **App-Level Token**. 
   - Name it (e.g., `srebot-socket-token`).
   - Add the `connections:write` scope.
   - **Save this token** – it starts with `xapp-...`. In the bot config, this is `SLACK_APP_TOKEN`.

## 3. Configuring Permissions (Scopes)

1. Go to **Features -> OAuth & Permissions**.
2. Scroll to **Scopes** -> **Bot Token Scopes**.
3. Add the following permissions:
   - `channels:history` — allow the bot to see messages in public channels.
   - `groups:history` — allow the bot to see messages in private channels.
   - `chat:write` — allow the bot to send messages.
   - `app_mention:read` — allow the bot to react to `@` mentions.

4. Scroll up and click **Install to Workspace**. After confirmation, you'll receive a **Bot User OAuth Token** (starts with `xoxb-...`).
   - This is `SLACK_BOT_TOKEN` in the bot config.

## 4. Subscribing to Events

1. Go to **Features -> Event Subscriptions**.
2. Toggle **Enable Events**.
3. In the **Subscribe to bot events** section, add:
   - `message.channels`
   - `message.groups` (if you plan to use it in private channels)
   - `app_mention`
4. Click **Save Changes**.

## 5. Bot Configuration (Env)

Add the tokens and your target channel ID to your `.env` file or Helm configuration:

```bash
# Bot OAuth Token (xoxb-...)
SLACK_BOT_TOKEN=xoxb-your-bot-token
# App Level Token (xapp-...)
SLACK_APP_TOKEN=xapp-your-app-token
# The channel ID where the bot should listen for alerts
SLACK_CHANNEL_ID=C0123456789
```

> [!TIP]
> To find your channel ID, click on the channel name in Slack -> Settings -> look for "Channel ID" at the bottom.

## 6. Inviting the Bot to the Channel

The bot won't see any messages unless it's explicitly added to the channel:
1. Go to the desired Slack channel.
2. Type `/invite @your_bot_name`.

---

## How It Works

- **Automated Analysis**: If the bot is in a channel and has `channels:history` permissions, it will automatically pick up any messages matching the Alertmanager format and start analyzing them.
- **Mentions**: You can also mention the bot (`@SREBot`) followed by an alert text if you want a manual analysis trigger.
- **Threaded Analysis**: The bot posts the analysis results in the same channel. For "Firing" alerts, it first sends an "Analyzing..." placeholder and then edits it with the final report.
