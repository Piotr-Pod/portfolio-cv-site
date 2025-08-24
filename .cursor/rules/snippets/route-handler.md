```ts
// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  // TODO: send via Resend/Mailgun
  return NextResponse.json({ ok: true });
}
```
