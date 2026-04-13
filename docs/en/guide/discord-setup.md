# Discord Integration Setup

SREBot integration with Discord allows the bot to monitor channel messages, identify Alertmanager notifications, and perform automated AI analysis.

---

## 1. Registering an Application in Discord

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click the **New Application** button.
3. Enter a name (e.g., `SREBot`) and confirm.

## 2. Creating a Bot and Obtaining a Token

1. Select **Bot** from the left sidebar.
2. Click **Reset Token** (or **Copy Token** if already visible) to get your bot token.
   - **Save this token!** In the bot configuration, this is `DISCORD_BOT_TOKEN`.
3. Scroll down in the same section to **Privileged Gateway Intents**.
4. **IMPORTANT**: Enable the **Message Content Intent** toggle. Without this, the bot will not be able to read alert text.
5. Click **Save Changes**.

## 3. Inviting the Bot to Your Server

1. Go to **OAuth2 -> URL Generator**.
2. Select `bot` in the **Scopes** list.
3. In the **Bot Permissions** list that appears, select:
   - `Read Messages / View Channels`
   - `Send Messages`
   - `Embed Links` (recommended)
   - `Read Message History`
4. Copy the generated URL at the bottom and open it in your browser.
5. Select your server and authorize the bot.

## 4. Obtaining the Channel ID

1. In Discord, go to **User Settings -> Advanced**.
2. Enable **Developer Mode**.
3. Right-click the channel where the bot should listen for alerts and select **Copy Channel ID**.
   - This numeric value is `DISCORD_CHANNEL_ID` in the bot configuration.

## 5. Bot Configuration (Env)

Add the collected information to your `.env` file or Helm chart settings:

```bash
# Bot token from Discord Developer Portal
DISCORD_BOT_TOKEN=MTAx...your.token...
# Channel ID (Snowflake ID)
DISCORD_CHANNEL_ID=123456789012345678
```

---

## How it Works

- **Automatic Analysis**: Once added to a channel with read permissions, the bot automatically intercepts messages matching Alertmanager patterns and begins its analysis.
- **Thread Support**: If alerts are posted in Threads or Forums, the bot will reply within that specific thread.
- **Process Indication**: When an alert is received, the bot first sends a `🔍 Analyzing...` placeholder and then edits it with the full RCA report.
- **Status Updates**: If an alert moves to `Resolved` status, the bot sends a confirmation by replying to the original message.

---

## Summary: Required Bot Permissions

For SREBot to function correctly on Discord, the following options must be enabled:

**Developer Portal (Bot Section):**
- ✅ **Message Content Intent** (under Privileged Gateway Intents)

**Developer Portal (URL Generator):**
- ✅ **View Channels** (General Permissions)
- ✅ **Send Messages** (Text Permissions)
- ✅ **Read Message History** (Text Permissions)

**Discord Server Settings (for private channels):**
If use in a private channel is required, add the bot to its permissions and grant:
- ✅ **View Channel**
- ✅ **Send Messages**
- ✅ **Read Message History**

> [!IMPORTANT]
> Ensure the bot has a role with the `Read Message History` permission, otherwise it won't be able to correctly link Resolved notifications to the original alerts.
