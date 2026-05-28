import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: "/docs/",
    title: "SREBot Docs",
    description:
      "Документация SREBot: AI SRE-копилот для анализа инцидентов в Kubernetes",
    cleanUrls: true,
    lastUpdated: true,
    head: [
      // Open Graph
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:site_name", content: "SREBot Docs" }],
      [
        "meta",
        {
          property: "og:image",
          content: "https://srebot.site360.tech/og-image.png",
        },
      ],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      [
        "meta",
        {
          name: "twitter:image",
          content: "https://srebot.site360.tech/og-image.png",
        },
      ],
    ],
    sitemap: {
      hostname: "https://srebot.site360.tech",
      transformItems: (items) =>
        items.map((item) => ({
          ...item,
          url: item.url ? `docs/${item.url}` : "docs",
          links: item.links?.map((link) => ({
            ...link,
            url: link.url ? `docs/${link.url}` : "docs",
          })),
        })),
    },
    themeConfig: {
      logo: "/logo.svg",
      search: {
        provider: "local",
      },
    },
    transformPageData(pageData) {
      const canonical = `https://srebot.site360.tech/docs/${pageData.relativePath}`;
      const isEn = pageData.relativePath.startsWith("en/");
      const ruPath = isEn
        ? pageData.relativePath.replace(/^en\//, "")
        : pageData.relativePath;
      const enPath = isEn
        ? pageData.relativePath
        : `en/${pageData.relativePath}`;

      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(
        ["link", { rel: "canonical", href: canonical }],
        [
          "link",
          {
            rel: "alternate",
            hreflang: "ru",
            href: `https://srebot.site360.tech/docs/${ruPath}`,
          },
        ],
        [
          "link",
          {
            rel: "alternate",
            hreflang: "en",
            href: `https://srebot.site360.tech/docs/${enPath}`,
          },
        ],
        [
          "link",
          {
            rel: "alternate",
            hreflang: "x-default",
            href: `https://srebot.site360.tech/docs/${ruPath}`,
          },
        ],
      );
    },
    locales: {
      root: {
        label: "Русский",
        lang: "ru",
        themeConfig: {
          nav: [
            { text: "Руководство", link: "/guide/introduction" },
            { text: "Вернуться на сайт", link: "https://srebot.site360.tech" },
          ],
          sidebar: [
            {
              text: "О платформе",
              items: [
                { text: "Введение", link: "/guide/introduction" },
                { text: "Быстрый старт", link: "/guide/setup" },
              ],
            },
            {
              text: "Использование",
              items: [
                { text: "Веб-дашборд", link: "/guide/dashboard" },
                {
                  text: "Управление организациями",
                  link: "/guide/organizations",
                },
                { text: "Управление командой", link: "/guide/team-management" },
                { text: "Общение с ботом", link: "/guide/interaction" },
                { text: "Настройка Telegram", link: "/guide/telegram-setup" },
                { text: "Настройка Slack", link: "/guide/slack-setup" },
                { text: "Настройка Discord", link: "/guide/discord-setup" },
                {
                  text: "Форматирование алертов",
                  link: "/guide/alert-formatting",
                },
                {
                  text: "Настройки бота (Env/YAML)",
                  link: "/guide/configuration",
                },
              ],
            },
          ],
          editLink: {
            pattern:
              "https://github.com/shadrus/srebot-docs/edit/main/docs/:path",
            text: "Редактировать эту страницу на GitHub",
          },
          footer: {
            message: "Выпущено под лицензией MIT.",
            copyright: "Copyright © 2026 SREBot",
          },
        },
      },
      en: {
        label: "English",
        lang: "en",
        link: "/en/",
        description:
          "SREBot Docs: AI SRE Copilot for Kubernetes Incident Analysis",
        themeConfig: {
          editLink: {
            pattern:
              "https://github.com/shadrus/srebot-docs/edit/main/docs/:path",
            text: "Edit this page on GitHub",
          },
          nav: [
            { text: "Guide", link: "/en/guide/introduction" },
            { text: "Back to Site", link: "https://srebot.site360.tech" },
          ],
          sidebar: [
            {
              text: "Overview",
              items: [
                { text: "Introduction", link: "/en/guide/introduction" },
                { text: "Getting Started", link: "/en/guide/setup" },
              ],
            },
            {
              text: "Usage",
              items: [
                { text: "Web Dashboard", link: "/en/guide/dashboard" },
                {
                  text: "Organization Management",
                  link: "/en/guide/organizations",
                },
                { text: "Team Management", link: "/en/guide/team-management" },
                {
                  text: "Communicating with Bot",
                  link: "/en/guide/interaction",
                },
                { text: "Telegram Setup", link: "/en/guide/telegram-setup" },
                { text: "Slack Setup", link: "/en/guide/slack-setup" },
                { text: "Discord Setup", link: "/en/guide/discord-setup" },
                {
                  text: "Alert Formatting",
                  link: "/en/guide/alert-formatting",
                },
                { text: "Bot Configuration", link: "/en/guide/configuration" },
              ],
            },
          ],
          footer: {
            message: "Released under the MIT License.",
            copyright: "Copyright © 2026 SREBot",
          },
        },
      },
    },
  }),
);
