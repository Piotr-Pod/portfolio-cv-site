```ts
// lib/seo.ts
import { DefaultSeoProps } from "next-seo";
export const defaultSeo: DefaultSeoProps = {
  titleTemplate: "%s | Firma",
  defaultTitle: "Firma",
  description: "Opis strony...",
  openGraph: { type: "website", site_name: "Firma" }
};
```
```tsx
// app/layout.tsx
import { DefaultSeo } from "next-seo";
import { defaultSeo } from "@/lib/seo";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <DefaultSeo {...defaultSeo} />
        {children}
      </body>
    </html>
  );
}
```
