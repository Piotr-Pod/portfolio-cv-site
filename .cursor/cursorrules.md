# Cursor Rules — Rdzeń (Next.js + OpenAPI BFF)

## Priorytety
1) **TypeScript + Next.js App Router**.
2) **Tailwind + shadcn/ui + Radix UI**.
3) **A11y (WCAG 2.2)**.  
4) **OpenAPI** jako źródło prawdy; brak bezpośrednich wywołań do backendu poza warstwą **BFF**.

## Zasady niezmienne
- Nie używaj Styled Components, SCSS, CSS Modules ani inline-styles, z wyjątkiem niezbędnych dynamicznych przypadków.
- Nie wykonuj `fetch` w komponentach UI — używaj wyłącznie `lib/api/*`.
- Każda nowa funkcja/UI → uwzględnij dostępność (focus, kontrast, klawiatura) i test a11y.
- i18n przez **next-intl** (routing `/pl`, `/en`). SEO przez **next-seo** + **next-sitemap**.
- Analytics: **Plausible** lub **Umami** (bez cookies).

## Moduły (czytaj przed generowaniem kodu)
- Frontend: `./cursorrules/10-frontend.md`
- Content: `./cursorrules/20-content.md`
- Formularze/E-mail: `./cursorrules/30-forms-email.md`
- CV PDF: `./cursorrules/40-cv-pdf.md`
- A11y: `./cursorrules/50-a11y.md`
- OpenAPI/BFF: `./cursorrules/60-api-openapi-bff.md`
- Hosting/CI: `./cursorrules/70-ci-cd.md`
- Snippety: `./cursorrules/snippets/*`

## Gotowe komendy dla Cursor
- „Użyj wzorca z `snippets/component-pattern.md`”
- „Waliduj dane z `snippets/route-handler.md`”
- „Generuj klienta z `snippets/api-client.md`”
