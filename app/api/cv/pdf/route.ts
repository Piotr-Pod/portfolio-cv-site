import { NextResponse } from "next/server";
import playwright from "playwright";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locale = url.searchParams.get("lang") ?? "pl";
    
    // Sprawdź czy locale jest obsługiwane
    if (!["pl", "en"].includes(locale)) {
      return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const mainPageUrl = `${baseUrl}/${locale}`;

    // Uruchom przeglądarkę
    const browser = await playwright.chromium.launch({
      headless: true,
    });
    
    const page = await browser.newPage();
    
    // Ustaw viewport dla A4
    await page.setViewportSize({ width: 1200, height: 1600 });
    
    // Przejdź do strony głównej
    await page.goto(mainPageUrl, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });

    // Poczekaj na załadowanie treści
    await page.waitForTimeout(2000);

    // Generuj PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm"
      }
    });

    await browser.close();

    // Zwróć PDF z odpowiednimi nagłówkami
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cv-piotr-podgorski-${locale}.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache na 1 godzinę
      },
    });
  } catch (error) {
    console.error("Error generating CV PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate CV PDF" },
      { status: 500 }
    );
  }
}
