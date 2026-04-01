# Telegram Integration Setup

Integrating SREBot with Telegram allows the bot to read messages in your group chat, identify alerts from Alertmanager, and automatically reply with detailed RCA reports.

---

## 1. Create a Bot via BotFather

1. Open Telegram and find the [@BotFather](https://t.me/botfather) bot.
2. Send the `/newbot` command.
3. Enter a **Display Name** for your bot (e.g., `My SREBot`).
4. Enter a **Username** for your bot — it must end in `bot` (e.g., `my_srebot_bot`).
5. BotFather will provide an **HTTP API Token** formatted like this:
   ```
   123456789:AAFhd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Save this token securely; you will need it during configuration.

> [!TIP]
> The bot's username will be visible to all chat participants. We recommend using something recognizable to your team, like `acme_sre_bot`.

---

## 2. Configure Bot Permissions (Group Privacy)

By default, Telegram bots in groups only receive messages that start with `/` (commands) or mentions of the bot. To allow SREBot to read all messages (including Alertmanager alerts), you must disable Group Privacy mode.

1. In the chat with **@BotFather**, send `/mybots`.
2. Select your bot from the list.
3. Click **Bot Settings → Group Privacy**.
4. Click **Turn off**.
5. Verify that the status changed to `Group Privacy is DISABLED`.

> [!IMPORTANT]
> Without this step, the bot **will not see** Alertmanager messages and will never initiate analysis.

---

## 3. Retrieve Group Chat ID

SREBot needs to know the ID of the specific chat it should monitor. To find it:

**Method 1 — Using @userinfobot:**
1. Add [@userinfobot](https://t.me/userinfobot) to a temporary chat or message it directly.
2. Forward any message from your incident chat to it.
3. The bot will respond with sender details and a `Forwarded from chat` entry with the numeric ID.

**Method 2 — Using the Telegram API:**
1. Add your bot to the desired chat.
2. Send any message to the chat.
3. Open the following URL in your browser:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
4. Find the `"chat": {"id": -100123456789, ...}` field in the response.

> [!NOTE]
> Group chat IDs are always **negative** and usually start with `-100`. For example: `-1001234567890`.

---

## 4. Add the Bot to the Chat

1. Open your incident chat in Telegram.
2. Click on the chat name → **Add Member**.
3. Search for the bot by its username and add it.
4. Ensure the bot has permissions to **read messages** — for standard groups, this happens automatically once Group Privacy is disabled (Step 2).

> [!TIP]
> If the chat is a **Supergroup** or a **Channel**, add the bot as an **Administrator** with message-reading privileges. This is required for reading messages posted via the Alertmanager webhook.

---

## 5. Configure the Bot (Env)

Once you have gathered all details, add them to your `.env` file or Helm `values.yaml` configuration:

```bash
# Bot token from BotFather
TELEGRAM_BOT_TOKEN=123456789:AAFhd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your group chat ID (negative number)
TELEGRAM_CHANNEL_ID=-1001234567890
```

Or in `values.yaml`:

```yaml
config:
  telegramBotToken: "123456789:AAFhd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  telegramChatId: "-1001234567890"
```

---

## How It Works Post-Setup

After startup, SREBot connects to Telegram via **long-polling** and monitors the specified chat. When an Alertmanager notification appears, the bot:

1. Parses the message to extract alert metadata.
2. Checks for deduplication — if the alert is already being processed, it skips it.
3. Posts an **Analyzing...** reply placeholder to the original message.
4. Executes the AI analysis and replaces the placeholder with the final RCA report.
