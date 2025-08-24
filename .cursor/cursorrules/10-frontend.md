# 10 — Frontend

- **Next.js (App Router) + TypeScript**. Stosuj Server Components, chyba że potrzebujesz stanu/efektów → Client.
- **Tailwind + shadcn/ui + Radix UI**. Najpierw komponenty shadcn, dopiero później util-klasy.
- **Framer Motion** dla animacji (honoruj `useReducedMotion`).
- **next-intl**: locales `["pl","en"]`, prefix `/pl` `/en`. Klucze w `messages/*.json`.
- **SEO**: **next-seo** (DefaultSeo) + **next-sitemap**. Każda route ma metadane i og:image.
- **Analytics**: **Plausible** lub **Umami** (bez cookies).

**Nie rób:**
- CSS Modules/SCSS, nadmiarowych global styles poza `globals.css` i tokenami.
- „magicznych” helperów bez testów/typów.

**Przykłady:**
- Patrz `snippets/next-seo.md`, `snippets/next-intl.md`, `snippets/component-pattern.md`.
