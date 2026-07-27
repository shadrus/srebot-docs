---
title: Time Messenger Integration Setup
description: "Connect SREBot to Time Messenger: create a bot, obtain a token and channel ID, and configure Helm."
---

# Time Messenger Integration Setup

SREBot supports the corporate messenger
[Time](https://time-messenger.ru/) alongside Telegram, Slack, and Discord. The bot reads
Alertmanager notifications in a selected channel, starts an RCA, and replies in the incident
thread.

The integration uses Time API v4: new posts arrive over an authenticated WebSocket connection,
while replies and message edits use the REST API.

## 1. Create a Bot in Time

Bot account creation must be enabled in your Time workspace.

1. Open the main Time menu and select **Integrations**.
2. Go to **Bot Accounts** and click **Add Bot Account**.
3. Set the bot's name, username, and optionally its avatar.
4. Copy the token shown after the bot is created.

::: danger Save the token
Time displays the bot token only once. Store it as a secret and never commit it to Git.
:::

See Time's official
[bot creation guide](https://docs.time-messenger.ru/api/cookbook/create-a-bot/) for more detail.

## 2. Add the Bot to the Channel

Add the new bot to the channel where Alertmanager posts notifications. The bot account must be
able to:

- read channel posts;
- publish posts and thread replies;
- edit and delete its own posts.

Record the channel's string ID for `TIME_CHANNEL_ID`. Obtain it through the Time API or from your
workspace administrator. Do not use the channel display name in place of its ID.

## 3. Verify the Token

Verify the Time base URL and token with an API request:

```bash
curl --fail-with-body \
  --header "Authorization: Bearer <TIME_TOKEN>" \
  "https://time.example.com/api/v4/users/me"
```

The response should describe the bot account. `TIME_BASE_URL` must contain only the server's base
address, without the `/api/v4` suffix.

## 4. Configure SREBot

For Docker Compose or an `.env` deployment, set:

```dotenv
TIME_BASE_URL=https://time.example.com
TIME_TOKEN=replace-with-Time-bot-token
TIME_CHANNEL_ID=replace-with-Time-channel-id
SAAS_AGENT_TOKEN=replace-with-SREBot-agent-token
```

For Helm, add the credentials to `values.yaml`:

```yaml
secrets:
  time_base_url: "https://time.example.com"
  time_token: "replace-with-Time-bot-token"
  time_channel_id: "replace-with-Time-channel-id"
  saas_agent_token: "replace-with-SREBot-agent-token"
```

For production and GitOps, create a Kubernetes Secret in advance:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: srebot-secret
type: Opaque
stringData:
  TIME_BASE_URL: "https://time.example.com"
  TIME_TOKEN: "replace-with-Time-bot-token"
  TIME_CHANNEL_ID: "replace-with-Time-channel-id"
  SAAS_AGENT_TOKEN: "replace-with-SREBot-agent-token"
```

Then reference it from `values.yaml`:

```yaml
secrets:
  existingSecret: "srebot-secret"
```

::: warning Only one chat integration
One SREBot process can use only one chat platform. When selecting Time, leave the Telegram, Slack,
and Discord credentials empty or the bot will stop during startup with a configuration error.
:::

## 5. Verify the Integration

After startup, the logs should indicate that the `time` integration was selected, the WebSocket
connected, and the bot is listening to the configured channel. Send a test alert to that channel.

SREBot creates a separate thread for every alert group. Follow-up questions and the `mute`,
`unmute`, and `status` commands work inside these threads. Start a general diagnostic query by
directly mentioning the bot's `@username`.

If the bot does not respond, verify:

- SREBot can reach `TIME_BASE_URL` over HTTPS and WebSocket;
- the bot belongs to the channel identified by `TIME_CHANNEL_ID`;
- the account can read the channel and post messages;
- the token belongs to the bot account and has not been revoked;
- no other chat integration is configured at the same time.
