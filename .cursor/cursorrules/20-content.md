# 20 — Treści (MDX + Contentlayer)

- Blog i case studies w **MDX** zarządzane przez **Contentlayer** — źródło prawdy w repo.
- Timeline/certyfikaty: pliki **YAML/JSON** (szybkie na MVP).

**Zasady:**
- Każdy wpis ma frontmatter (title, description, date, locale, tags).
- Struktura katalogów: `content/{blog,case-studies}/[slug]/index.mdx`.
- Dodaj pre-render ISR dla list; szczegóły przez SSR/SSG w zależności od potrzeby.
