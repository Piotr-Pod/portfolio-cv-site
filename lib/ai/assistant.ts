import OpenAI from 'openai';
import { logBackendProcessing } from '@/lib/monitoring/performance';

type ProcessMessageParams = {
  message: string;
  threadId?: string | null;
  locale: 'pl' | 'en';
  assistantId: string;
};

/**
 * Parsuje odpowiedź AI i usuwa teksty źródłowe w formacie 【12:0†source】
 */
function parseAiResponse(text: string): string {
  // Usuwa teksty źródłowe w formacie 【liczba:liczba†source】
  return text.replace(/【\d+:\d+†source】/g, '').trim();
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getOrCreateThread(threadId?: string | null) {
  if (threadId) {
    return { id: threadId };
  }
  const thread = await openai.beta.threads.create();
  return thread;
}

export async function processMessage(params: ProcessMessageParams) {
  const startTime = Date.now();
  
  // Timing: getOrCreateThread
  const threadStartTime = Date.now();
  const thread = await getOrCreateThread(params.threadId);
  const threadTime = Date.now() - threadStartTime;
  console.log(`[AI Assistant] getOrCreateThread took ${threadTime}ms`);

  // Timing: message creation
  const messageStartTime = Date.now();
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: params.message
  });
  const messageTime = Date.now() - messageStartTime;
  console.log(`[AI Assistant] Message creation took ${messageTime}ms`);

  // Timing: run creation
  const runStartTime = Date.now();
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: params.assistantId,
    additional_instructions:
      params.locale === 'pl'
        ? 'Odpowiadaj po polsku. Stosuj się do zasad asystenta.'
        : 'Respond in English. Follow assistant rules.'
  });
  const runTime = Date.now() - runStartTime;
  console.log(`[AI Assistant] Run creation took ${runTime}ms`);

  // Timing: run polling
  const pollingStartTime = Date.now();
  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  // simple polling MVP (cap at ~30s)
  const started = Date.now();
  while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
    if (Date.now() - started > 30000) break;
    await new Promise((r) => setTimeout(r, 750));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }
  const pollingTime = Date.now() - pollingStartTime;
  console.log(`[AI Assistant] Run polling took ${pollingTime}ms`);

  if (runStatus.status === 'failed') {
    const processingTime = Date.now() - startTime;
    console.log(`[AI Assistant] Processing failed after ${processingTime}ms for thread ${thread.id}`);
    logBackendProcessing(processingTime, thread.id, 0, false, 'AI processing failed');
    return { message: params.locale === 'pl' ? 'Wystąpił błąd.' : 'An error occurred.', threadId: thread.id };
  }

  // Timing: message retrieval
  const retrievalStartTime = Date.now();
  const messages = await openai.beta.threads.messages.list(thread.id, { limit: 1 });
  const last = messages.data[0];
  const rawText = last?.content?.[0]?.type === 'text' ? last.content[0].text.value : '';
  const retrievalTime = Date.now() - retrievalStartTime;
  console.log(`[AI Assistant] Message retrieval took ${retrievalTime}ms`);
  
  // Parsuje odpowiedź i usuwa teksty źródłowe
  const parsedText = rawText ? parseAiResponse(rawText) : '';

  const processingTime = Date.now() - startTime;
  console.log(`[AI Assistant] Processing completed in ${processingTime}ms for thread ${thread.id}, response length: ${parsedText.length} chars`);
  logBackendProcessing(processingTime, thread.id, parsedText.length, true);

  return { message: parsedText || (params.locale === 'pl' ? 'Brak odpowiedzi.' : 'No response.'), threadId: thread.id };
}


