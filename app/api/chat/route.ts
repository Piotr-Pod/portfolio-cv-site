import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processMessage } from '@/lib/ai/assistant';
import { checkRateLimit } from '@/lib/chat/rate-limit';
import { validateInput } from '@/lib/chat/security';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  threadId: z.string().nullable().optional(),
  locale: z.enum(['pl', 'en']).default('pl')
});

export async function POST(req: NextRequest) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ip = (ipHeader.split(',')[0] || 'unknown').trim();
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    // Debug raw body to diagnose client payload issues (temporary logging)
    try {
      console.log('Chat API raw body:', body);
    } catch {}
    const { message, threadId, locale } = ChatRequestSchema.parse(body);

    const securityCheck = validateInput(message);
    if (!securityCheck.isValid) {
      console.log('Invalid input detected', securityCheck);
      return NextResponse.json({ error: 'Invalid input detected' }, { status: 400 });
    }

    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Assistant not configured' }, { status: 500 });
    }

    const result = await processMessage({ message, threadId, locale, assistantId });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


