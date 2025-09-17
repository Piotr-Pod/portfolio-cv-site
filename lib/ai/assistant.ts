import OpenAI from 'openai';

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
  const thread = await getOrCreateThread(params.threadId);

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: params.message
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: params.assistantId,
    additional_instructions:
      params.locale === 'pl'
        ? 'Odpowiadaj po polsku. Stosuj się do zasad asystenta.'
        : 'Respond in English. Follow assistant rules.'
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  // simple polling MVP (cap at ~30s)
  const started = Date.now();
  while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
    if (Date.now() - started > 30000) break;
    await new Promise((r) => setTimeout(r, 750));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  if (runStatus.status === 'failed') {
    return { message: params.locale === 'pl' ? 'Wystąpił błąd.' : 'An error occurred.', threadId: thread.id };
  }

  const messages = await openai.beta.threads.messages.list(thread.id, { limit: 1 });
  const last = messages.data[0];
  const rawText = last?.content?.[0]?.type === 'text' ? last.content[0].text.value : '';
  
  // Parsuje odpowiedź i usuwa teksty źródłowe
  const parsedText = rawText ? parseAiResponse(rawText) : '';

  return { message: parsedText || (params.locale === 'pl' ? 'Brak odpowiedzi.' : 'No response.'), threadId: thread.id };
}


