'use client';

import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatMessage({ message }: { message: Message }) {
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
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <p className="flex-1">{message.content}</p>
      </div>
    </div>
  );
}


