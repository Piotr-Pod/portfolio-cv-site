import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Persona, P13nTranslateRequest, P13nTranslateResponse } from '@/types/p13n'

const AllowedPersonas: ReadonlyArray<Persona> = [
  'HR',
  'NonIT',
  'Child10',
  'Poet',
  'Developer',
  'Custom'
]

const BodySchema = z.object({
  postId: z.string().min(1).max(256),
  persona: z.enum([
    'HR',
    'NonIT',
    'Child10',
    'Poet',
    'Developer',
    'Custom'
  ] as [Persona, ...Persona[]]),
  prompt: z.string().min(1).max(800),
  contentMarkdown: z.string().min(1)
}) satisfies z.ZodType<P13nTranslateRequest>

const DEBUG = (process.env.DEBUG === 'true') || (process.env.NEXT_PUBLIC_METRICS_DEBUG === 'true')

function dbg(...args: unknown[]) {
  if (DEBUG) console.log('[p13n]', ...args)
}

async function callLLM(prompt: string, contentMarkdown: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const systemInstruction = [
    'Jesteś asystentem do personalizacji treści bloga.',
    'Zwróć wyłącznie treść w formacie Markdown.',
    'Zachowaj: nagłówki (#), listy, cytaty, tabele, linki, obrazki.',
    'Nie zmieniaj ani nie tłumacz: bloków kodu ``` oraz inline code, URL-i, YAML frontmatter.',
    'Nie dodawaj komentarzy HTML ani metadanych. Nie dodawaj wstępów/podsumowań, jeśli nie ma ich w tekście.'
  ].join(' ')

  const userContent = [
    'PERSONA INSTRUKCJA:',
    prompt,
    '',
    '--- TREŚĆ MARKDOWN DO PRZETWORZENIA (NIE ZMIENIAJ KODU) ---',
    contentMarkdown
  ].join('\n')

  dbg('OpenAI request compose', {
    model,
    promptPreview: prompt.slice(0, 160),
    contentLen: contentMarkdown.length
  })

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userContent }
      ],
      temperature: 0.2,
      max_tokens: 10000
    })
  })

  if (!res.ok) {
    const text = await res.text()
    dbg('OpenAI error', res.status, text.slice(0, 500))
    throw new Error(`OpenAI error: ${res.status} ${text}`)
  }

  const data = (await res.json()) as any
  const content = data.choices?.[0]?.message?.content?.trim()
  dbg('OpenAI response', {
    usage: data.usage ?? null,
    contentPreview: typeof content === 'string' ? content.slice(0, 200) : null,
    contentLen: typeof content === 'string' ? content.length : null
  })
  if (!content) throw new Error('Brak treści z modelu')
  return content
}

// Check if p13n feature is enabled
function isP13nEnabled(): boolean {
  return process.env.P13N_ENABLED === 'true'
}

// Note: HEAD removed to avoid noisy 404s on client

export async function POST(request: Request) {
  // Check if p13n feature is enabled
  if (!isP13nEnabled()) {
    return NextResponse.json({ error: 'P13n feature is disabled' }, { status: 404 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { persona, prompt, contentMarkdown } = parsed.data
  dbg('Request received', {
    postId: parsed.data.postId,
    persona,
    promptLen: prompt.length,
    contentLen: contentMarkdown.length
  })
  if (!AllowedPersonas.includes(persona)) {
    return NextResponse.json({ error: 'Unsupported persona' }, { status: 400 })
  }

  try {
    const output = await callLLM(prompt, contentMarkdown)
    const res: P13nTranslateResponse = { contentMarkdown: output }
    dbg('Response ready', { outputLen: output.length, res: res })
    return NextResponse.json(res)
  } catch (err) {
    dbg('Translation failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}


