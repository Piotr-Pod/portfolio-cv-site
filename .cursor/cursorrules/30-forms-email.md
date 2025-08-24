# 30 — Formularze i e-mail

- **Route Handlers** w `app/api/*`.
- Walidacja wejścia: **zod** (schema współdzielona z UI).
- Wysyłka e-mail: **Resend** lub **Mailgun** (sekrety przez env).

**Format odpowiedzi błędu**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid payload", "details": { /* zod */ } } }
```

**Dobre praktyki**
- Prosty rate-limit (np. per IP) w MVP.
- Logi błędów na serwerze, nie ujawniaj szczegółów klientowi.
- CSRF niepotrzebny przy tym samym originie, ale waliduj długości i typy.
- Patrz `snippets/route-handler.md`.
