```ts
// middleware.ts — routing /pl /en
import createMiddleware from "next-intl/middleware";
export default createMiddleware({ locales: ["pl", "en"], defaultLocale: "pl", localePrefix: "as-needed" });
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
```
```ts
// app/[locale]/layout.tsx — szkic
export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```
