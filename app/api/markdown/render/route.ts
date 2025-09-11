import { NextResponse } from 'next/server'
import { z } from 'zod'
import { renderMarkdownStrictToHtml } from '@/lib/markdown'

const BodySchema = z.object({ markdown: z.string().min(1) })

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  const html = await renderMarkdownStrictToHtml(parsed.data.markdown)
  return NextResponse.json({ html })
}


