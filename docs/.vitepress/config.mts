import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    base: '/docs/',
    title: "SREBot",
    description: "Официальная документация платформы SREBot",
    cleanUrls: true,
    lastUpdated: true,
    sitemap: {
      hostname: 'https://srebot.site360.tech'
    },
    themeConfig: {
      logo: '/logo.svg',
      search: {
        provider: 'local'
      }
  },
  locales: {
    root: {
      label: 'Русский',
      lang: 'ru',
      themeConfig: {
        nav: [
          { text: 'Руководство', link: '/guide/introduction' },
          { text: 'Вернуться на сайт', link: 'https://srebot.site360.tech' }
        ],
        sidebar: [
          {
            text: 'О платформе',
            items: [
              { text: 'Введение', link: '/guide/introduction' },
              { text: 'Быстрый старт', link: '/guide/setup' }
            ]
          },
          {
            text: 'Использование',
            items: [
              { text: 'Веб-дашборд', link: '/guide/dashboard' },
              { text: 'Настройка Telegram', link: '/guide/telegram-setup' },
              { text: 'Настройка Slack', link: '/guide/slack-setup' },
              { text: 'Форматирование алертов', link: '/guide/alert-formatting' },
              { text: 'Настройки бота (Env/YAML)', link: '/guide/configuration' }
            ]
          }
        ],
        footer: {
          message: 'Выпущено под лицензией MIT.',
          copyright: 'Copyright © 2026 SREBot'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      description: 'Official SREBot Platform Documentation',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/introduction' },
          { text: 'Back to Site', link: 'https://srebot.site360.tech' }
        ],
        sidebar: [
          {
            text: 'Overview',
            items: [
              { text: 'Introduction', link: '/en/guide/introduction' },
              { text: 'Getting Started', link: '/en/guide/setup' }
            ]
          },
          {
            text: 'Usage',
            items: [
              { text: 'Web Dashboard', link: '/en/guide/dashboard' },
              { text: 'Telegram Setup', link: '/en/guide/telegram-setup' },
              { text: 'Slack Setup', link: '/en/guide/slack-setup' },
              { text: 'Alert Formatting', link: '/en/guide/alert-formatting' },
              { text: 'Bot Configuration', link: '/en/guide/configuration' }
            ]
          }
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2026 SREBot'
        }
      }
    }
  }
})
)
