# 40 — CV PDF (Puppeteer/Playwright)

- Źródło: strona `/cv` (spójny branding).
- Generacja: **Puppeteer** lub **Playwright**.
- Endpoint: `app/api/cv/pdf/route.ts` (obsługa PL/EN).

**Wymogi**
- Użyj dedykowanego CSS do wydruku (rozmiar A4, marginesy, ukryte elementy interaktywne).
- Dodaj cache-control dla pobierania PDF.

**Szkic handlera**
```ts
// app/api/cv/pdf/route.ts
import { NextResponse } from "next/server";
import playwright from "playwright";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("lang") ?? "pl";
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/cv`, { waitUntil: "networkidle" });
  const pdf = await page.pdf({ format: "A4" });
  await browser.close();
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv-${locale}.pdf"`
    }
  });
}
```
