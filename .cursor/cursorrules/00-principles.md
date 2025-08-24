# 00 — Zasady ogólne i styl pracy

## Styl
- Język: **TypeScript** z `strict: true`.
- Importy: najpierw biblioteki, potem aliasy (`@/`), potem ścieżki względne.
- Nazewnictwo: pascalCase dla komponentów, camelCase dla funkcji/zmiennych, SCREAMING_SNAKE_CASE dla stałych env.
- Zakazane: SCSS, Styled Components, CSS Modules, bezpośredni `fetch` w komponentach, ad-hoc inline styles.

## Architektura
- **Next.js App Router** (Server/Client Components sensownie rozdzielone).
- Warstwa API: **tylko** `lib/api/*` generowana z **OpenAPI** + cienkie fetchery.
- UI: **Tailwind + shadcn/ui + Radix**. Animacje: **Framer Motion** (z obsługą Reduced Motion).
- i18n: **next-intl** (routing `/pl`, `/en`). SEO: **next-seo + next-sitemap`**.

## Git / CI
- Commity: **Conventional Commits** (feat, fix, chore, docs, refactor, test, ci).
- PR: krótkie, z checklistą a11y i testów. Blokujące: lint, testy, Lighthouse (CI).
