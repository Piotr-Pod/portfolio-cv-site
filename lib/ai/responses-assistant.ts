import OpenAI from 'openai';
import { logBackendProcessing } from '@/lib/monitoring/performance';

type ProcessMessageParams = {
  message: string;
  threadId?: string | null;
  locale: 'pl' | 'en';
  model?: string;
};

/**
 * Parsuje odpowiedź AI i usuwa teksty źródłowe w formacie 【12:0†source】
 */
function parseAiResponse(text: string): string {
  // Usuwa teksty źródłowe w formacie 【liczba:liczba†source】
  return text.replace(/【\d+:\d+†source】/g, '').trim();
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// System prompt for the Responses API bot
const getSystemPrompt = (locale: 'pl' | 'en') => {
  if (locale === 'pl') {
    return `Jesteś pomocnym asystentem AI specjalizującym się w pomocy użytkownikom. 
Odpowiadaj po polsku w sposób profesjonalny, przyjazny i pomocny.
Jeśli nie znasz odpowiedzi na pytanie, szczerze to przyznaj i zaproponuj alternatywne rozwiązania.
Używaj jasnego i zrozumiałego języka.`;
  } else {
    return `You are a helpful AI assistant specializing in helping users.
Respond in English in a professional, friendly, and helpful manner.
If you don't know the answer to a question, honestly admit it and suggest alternative solutions.
Use clear and understandable language.`;
  }
};

export async function processMessageWithResponses(params: ProcessMessageParams) {
  const startTime = Date.now();
  
  try {
    // Prepare messages array for the conversation
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: getSystemPrompt(params.locale)
      },
      {
        role: 'user',
        content: params.message
      }
    ];

    // Timing: API call
    const apiStartTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: params.model || 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    });
    const apiTime = Date.now() - apiStartTime;
    console.log(`[AI Responses] API call took ${apiTime}ms`);

    const rawText = completion.choices[0]?.message?.content || '';
    
    // Parse response and remove source texts
    const parsedText = rawText ? parseAiResponse(rawText) : '';

    const processingTime = Date.now() - startTime;
    console.log(`[AI Responses] Processing completed in ${processingTime}ms, response length: ${parsedText.length} chars`);
    logBackendProcessing(processingTime, 'responses-api', parsedText.length, true);

    return { 
      message: parsedText || (params.locale === 'pl' ? 'Brak odpowiedzi.' : 'No response.'), 
      threadId: params.threadId // Keep the same threadId for consistency
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[AI Responses] Processing failed after ${processingTime}ms:`, error);
    logBackendProcessing(processingTime, 'responses-api', 0, false, error instanceof Error ? error.message : 'Unknown error');
    
    return { 
      message: params.locale === 'pl' ? 'Wystąpił błąd podczas przetwarzania wiadomości.' : 'An error occurred while processing the message.', 
      threadId: params.threadId 
    };
  }
}
