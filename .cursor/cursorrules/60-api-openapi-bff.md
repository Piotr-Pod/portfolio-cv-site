# 60 — OpenAPI & BFF (Spring-ready)

- Frontend zależy **wyłącznie** od kontraktu **OpenAPI** (YAML).  
- Generuj **typowanego klienta TS** dla frontu (np. `openapi-typescript`).  
- Warstwa dostępu do API: `lib/api/*` (po zmianie backendu podmieniasz tylko `BASE_URL` i ewentualnie auth).
- W MVP endpointy realizują **Next Route Handlers** (BFF). Później mogą stać się **proxy** do Springa (jeden origin, brak CORS).

**Struktura**
```
lib/api/
  client.ts        # generowany z openapi.yaml
  fetcher.ts       # cienka warstwa fetch (z auth, baseURL, error handling)
```

**Skrypt generacji** — patrz `snippets/api-client.md`.

**Proxy BFF (szkic)**
```ts
// app/api/proxy/example/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const r = await fetch(process.env.BACKEND_URL + "/example", { headers: { Authorization: `Bearer ${process.env.API_TOKEN}` } });
  const data = await r.json();
  return NextResponse.json(data);
}
```
