'use client';

import { cn } from '@/lib/utils';
import { ParsedResponse } from '@/lib/chat/response-parser';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  locale: 'pl' | 'en';
}

export function ChatMessage({ message, locale }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap overflow-hidden flex items-start gap-2',
          isUser ? 'bg-blue-500 text-white' : 'bg-muted'
        )}
      >
        {!isUser && (
          <div className="flex-shrink-0 mt-0.5">
            <img 
              src="/images/bot-avatar.png" 
              alt="Bot avatar" 
              className="h-8 w-8 rounded-full" 
            />
          </div>
        )}
        <div className="flex-1">
          {message.role === 'assistant' ? (
            <ParsedResponse text={message.content} locale={locale} />
          ) : (
            <p>{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}


