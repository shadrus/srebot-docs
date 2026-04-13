# AGENTS.md — Development Standards

This document defines the standards for all contributors (human and AI agents) working on **srebot-docs**.

---

## Package Management

Use **`npm`** (scripts are defined in `package.json`).

```bash
npm install              # install all dependencies
npm run docs:dev         # start VitePress dev server
npm run docs:build       # build static site for production
npm run docs:preview     # preview production build locally
```

---

## Project Overview

This is a **VitePress** documentation site for the SREBot platform.

- Framework: **VitePress 1.5+** (Vue 3.5+)
- Diagrams: **Mermaid** via `vitepress-plugin-mermaid`
- Source content lives in `docs/`
- VitePress config: `docs/.vitepress/config.mts`

---

## Code Style

### Markdown Content

- Use **ATX-style headings** (`#`, `##`, etc.) — no Setext-style.
- One blank line before and after headings.
- Use **fenced code blocks** with language identifiers.
- Keep lines under **100 characters** in prose where practical.
- Use relative links between documentation pages.
- Place images in `docs/public/` and reference with absolute paths (`/image.png`).

### Vue / TypeScript (if custom components are added)

- Use **Vue 3 Composition API** (`<script setup>`) — no Options API.
- Use **TypeScript** for any `.ts` / `.vue` files.
- Prefer explicit types over `any`.

### Formatting

- Run Prettier after every set of changes (if configured):
  ```bash
  npx prettier --write "docs/**/*.{md,mts,vue}"
  ```

---

## Documentation Structure

```
docs/
├── .vitepress/
│   └── config.mts       # VitePress configuration (nav, sidebar, theme)
├── public/              # Static assets (images, etc.)
├── index.md             # Russian landing page
├── en/                  # English localization
│   └── ...
└── guide/               # Guide pages (Russian)
    └── ...
```

### Adding a New Page

1. Create a `.md` file in the appropriate directory.
2. Add the entry to the sidebar config in `docs/.vitepress/config.mts`.
3. If the page should appear in navigation, update the `nav` section too.
4. Preview locally with `npm run docs:dev` before committing.

### Localization

- Russian content lives at `docs/` root and `docs/guide/`.
- English content lives under `docs/en/`.
- Keep both locales in sync when updating documentation.

---

## Modern Type Hints (Python 3.13+)

If any Python scripting or tooling is added to this project (e.g., build scripts, generators), it **must** follow modern Python type hint conventions:

| Rule | Policy |
|---|---|
| `from __future__ import annotations` | **Do not use** — Python 3.13+ handles this natively |
| Type unions | Use `X \| Y` (PEP 604), not `Optional[X]` or `Union[X, Y]` |
| Generic aliases | Use `list[X]`, `dict[K, V]`, `tuple[X, ...]` — not `typing.List`, `typing.Dict` |
| `TypedDict` | Use `class MyDict(TypedDict):` for structured dicts |
| `@override` | Use `typing.override` (PEP 698) when overriding base class methods |
| Type narrowing | Use `isinstance(x, int) \| is None` patterns; prefer `TypeGuard` / `TypeIs` (PEP 742) for custom guards |
| `typing.override` decorator | Apply to all overridden methods for explicit signalling |
| Runtime type checking | Prefer `isinstance` checks or `type(x) is Y` — avoid `typing.get_type_hints` at runtime unless necessary |

---

## Git Workflow

- Commit messages: imperative mood, present tense (`Add deployment guide`, not `Added...`)
- Always preview changes locally before committing: `npm run docs:dev`
- Verify the production build succeeds: `npm run docs:build`

---

## Deployment

- The site is containerized via the `Dockerfile` at the project root.
- `nginx.conf` serves the built static files.
- `docker-compose.yml` orchestrates the deployment.
- After changing documentation, always verify the build: `npm run docs:build`
