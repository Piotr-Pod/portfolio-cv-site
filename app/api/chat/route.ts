import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processMessage } from '@/lib/ai/assistant';
import { processMessageWithResponses } from '@/lib/ai/responses-assistant';
import { checkRateLimit } from '@/lib/chat/rate-limit';
import { validateInput } from '@/lib/chat/security';
import { logApiRequest } from '@/lib/monitoring/performance';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  threadId: z.string().nullable().optional(),
  locale: z.enum(['pl', 'en']).default('pl'),
  botType: z.enum(['assistant', 'responses']).default('assistant')
});

export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();
  const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const ip = (ipHeader.split(',')[0] || 'unknown').trim();
  
  try {
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
    const { message, threadId, locale, botType } = ChatRequestSchema.parse(body);

    const securityCheck = validateInput(message);
    if (!securityCheck.isValid) {
      console.log('Invalid input detected', securityCheck);
      return NextResponse.json({ error: 'Invalid input detected' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Check if using assistant bot and validate assistant ID
    if (botType === 'assistant') {
      const assistantId = process.env.OPENAI_ASSISTANT_ID;
      if (!assistantId) {
        return NextResponse.json({ error: 'Assistant not configured' }, { status: 500 });
      }
    }

    const aiStartTime = Date.now();
    let result;
    
    if (botType === 'assistant') {
      const assistantId = process.env.OPENAI_ASSISTANT_ID!;
      result = await processMessage({ message, threadId, locale, assistantId });
    } else {
      result = await processMessageWithResponses({ message, threadId, locale });
    }
    
    const aiProcessingTime = Date.now() - aiStartTime;
    const totalRequestTime = Date.now() - requestStartTime;
    
    console.log(`[Chat API] Request completed in ${totalRequestTime}ms (AI processing: ${aiProcessingTime}ms) for IP: ${ip}`);
    logApiRequest(totalRequestTime, ip, true);
    
    return NextResponse.json(result);
  } catch (error) {
    const totalRequestTime = Date.now() - requestStartTime;
    console.error(`[Chat API] Error after ${totalRequestTime}ms:`, error);
    logApiRequest(totalRequestTime, ip, false, error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


