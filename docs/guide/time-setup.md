---
title: Настройка интеграции с Time Messenger
description: "Подключение SREBot к Time Messenger: создание бота, токен, ID канала и Helm."
---

# Настройка интеграции с Time Messenger

SREBot поддерживает корпоративный мессенджер
[Time](https://time-messenger.ru/) наравне с Telegram, Slack и Discord. Бот читает алерты
Alertmanager в выбранном канале, запускает RCA и отвечает в треде инцидента.

Интеграция работает с Time API v4: новые сообщения поступают через защищенное WebSocket-соединение,
а ответы и редактирование сообщений выполняются через REST API.

## 1. Создание бота в Time

В пространстве Time должно быть разрешено создание ботов.

1. Откройте главное меню Time и выберите **Integrations**.
2. Перейдите в **Bot Accounts** и нажмите **Add Bot Account**.
3. Укажите имя, username и при необходимости аватар бота.
4. После создания скопируйте выданный токен.

::: danger Сохраните токен
Time показывает токен бота только один раз. Храните его как секрет и не добавляйте в Git.
:::

Подробности приведены в официальной
[инструкции по созданию бота](https://docs.time-messenger.ru/api/cookbook/create-a-bot/).

## 2. Добавление бота в канал

Добавьте созданного бота в канал, куда Alertmanager отправляет уведомления. Для работы SREBot
учетная запись бота должна иметь возможность:

- читать сообщения канала;
- публиковать сообщения и ответы в тредах;
- редактировать и удалять собственные сообщения.

Запишите строковый ID канала — он используется как `TIME_CHANNEL_ID`. ID можно получить через
Time API или запросить у администратора пространства. Не используйте отображаемое имя канала
вместо ID.

## 3. Проверка токена

Проверьте базовый адрес Time и токен запросом к API:

```bash
curl --fail-with-body \
  --header "Authorization: Bearer <TIME_TOKEN>" \
  "https://time.example.com/api/v4/users/me"
```

В ответе должны вернуться данные созданного бота. В `TIME_BASE_URL` указывается только базовый
адрес сервера без суффикса `/api/v4`.

## 4. Настройка SREBot

Для Docker Compose или запуска через `.env` задайте:

```dotenv
TIME_BASE_URL=https://time.example.com
TIME_TOKEN=replace-with-Time-bot-token
TIME_CHANNEL_ID=replace-with-Time-channel-id
SAAS_AGENT_TOKEN=replace-with-SREBot-agent-token
```

Для Helm добавьте учетные данные в `values.yaml`:

```yaml
secrets:
  time_base_url: "https://time.example.com"
  time_token: "replace-with-Time-bot-token"
  time_channel_id: "replace-with-Time-channel-id"
  saas_agent_token: "replace-with-SREBot-agent-token"
```

Для production и GitOps рекомендуется заранее создать Kubernetes Secret:

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

И сослаться на него из `values.yaml`:

```yaml
secrets:
  existingSecret: "srebot-secret"
```

::: warning Только одна чат-интеграция
Один процесс SREBot может использовать только одну платформу. При выборе Time оставьте переменные
Telegram, Slack и Discord пустыми, иначе бот завершит запуск с ошибкой конфигурации.
:::

## 5. Проверка работы

После запуска в логах должны появиться сообщения о выборе интеграции `time`, подключении WebSocket
и канале, который слушает бот. Затем отправьте тестовый алерт в настроенный канал.

SREBot создаст отдельный тред для каждой группы алертов. Внутри треда доступны уточняющие вопросы
и команды `mute`, `unmute`, `status`. Произвольный диагностический запрос можно начать прямым
упоминанием `@username` бота.

Если бот не реагирует, проверьте:

- доступ SREBot к `TIME_BASE_URL` по HTTPS и WebSocket;
- членство бота в канале из `TIME_CHANNEL_ID`;
- права учетной записи на чтение канала и отправку сообщений;
- что токен принадлежит именно созданному боту и не был отозван;
- что другие чат-интеграции не настроены одновременно.
