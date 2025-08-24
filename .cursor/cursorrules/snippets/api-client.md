```bash
# package.json — skrypt generacji klienta
"scripts": {
  "gen:openapi": "openapi-typescript ./openapi.yaml -o ./lib/api/client.ts"
}
```
```ts
// lib/api/fetcher.ts — cienka warstwa fetch
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API_ERROR ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
```
