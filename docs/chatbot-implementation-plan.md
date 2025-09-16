# Plan implementacji wirtualnego asystenta - OpenAI Assistants API

## 🎯 Cel projektu

Stworzenie wirtualnego asystenta dla portfolio Piotra Podgórskiego, który będzie:
- Odpowiadał na pytania o CV, doświadczenie i projekty
- Umożliwiał umawianie spotkań przez cal.com
- Generował emaile przez Resend
- Był odporny na próby włamania i złośliwe prompty
- Miał własny UI w stylu strony (Tailwind + shadcn/ui)

## 🏗️ Architektura rozwiązania

### Komponenty systemu

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Chat Widget   │───▶│  Next.js API │───▶│ OpenAI Assistant│
│ (shadcn/ui)     │    │   Routes     │    │   + Functions   │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                       ┌──────────────┐    ┌─────────────────┐
                       │  Rate Limit  │    │  Knowledge Base │
                       │  + Security  │    │  (CV, Blog)     │
                       └──────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Cal.com +    │
                       │ Resend APIs  │
                       └──────────────┘
```

### Struktura plików

```
app/
├── api/
│   ├── chat/
│   │   ├── route.ts              # Główny endpoint chat
│   │   ├── assistant.ts          # Konfiguracja Assistant
│   │   └── functions.ts          # Function calling
│   └── chat/
│       ├── knowledge/
│       │   └── route.ts          # Zarządzanie knowledge base
│       └── session/
│           └── route.ts          # Zarządzanie sesjami
components/
├── chat/
│   ├── ChatWidget.tsx            # Główny komponent chat
│   ├── ChatMessage.tsx           # Komponent wiadomości
│   ├── ChatInput.tsx             # Input do wpisywania
│   ├── ChatButton.tsx            # Floating button
│   └── ChatModal.tsx             # Modal z chatem
lib/
├── ai/
│   ├── assistant.ts              # OpenAI Assistant client
│   ├── functions.ts              # Function definitions
│   └── knowledge.ts              # Knowledge base management
├── chat/
│   ├── types.ts                  # TypeScript types
│   ├── security.ts               # Security measures
│   └── rate-limit.ts             # Rate limiting
messages/
├── pl.json                       # Tłumaczenia PL (dodanie sekcji chat)
└── en.json                       # Tłumaczenia EN (dodanie sekcji chat)
```

## 🔧 Implementacja techniczna

### 1. OpenAI Assistant Configuration

**Plik: `lib/ai/assistant.ts`**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createAssistant() {
  return await openai.beta.assistants.create({
    name: "Piotr's Portfolio Assistant",
    instructions: `Jesteś asystentem Piotra Podgórskiego, Senior Java Developera z 8-letnim doświadczeniem.

ZASADY:
1. Odpowiadasz TYLKO na pytania związane z Piotrem, jego CV, doświadczeniem, projektami i umiejętnościami
2. NIE odpowiadasz na pytania niezwiązane z Piotrem lub jego portfolio
3. Jeśli pytanie nie dotyczy Piotra, grzecznie odmów i zaproponuj pytanie o jego doświadczenie
4. Używaj informacji z załączonych dokumentów (CV, blog posts, timeline)
5. Odpowiadaj w języku, w którym zostałeś zapytany (PL/EN)
6. Bądź profesjonalny, ale przyjazny
7. Jeśli nie znasz odpowiedzi, powiedz to szczerze

DOSTĘPNE FUNKCJE:
- book_meeting: umówienie spotkania przez cal.com
- send_email: wysłanie emaila przez Resend

NIE UDZIELAJ porad technicznych niezwiązanych z doświadczeniem Piotra.`,
    tools: [
      { type: "file_search" },
      { 
        type: "function", 
        function: {
          name: "book_meeting",
          description: "Umówienie spotkania z Piotrem przez cal.com",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description: "Powód spotkania"
              },
              preferred_date: {
                type: "string",
                description: "Preferowana data (opcjonalna)"
              }
            },
            required: ["reason"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "send_email",
          description: "Wysłanie emaila do Piotra przez Resend",
          parameters: {
            type: "object",
            properties: {
              subject: {
                type: "string",
                description: "Temat emaila"
              },
              message: {
                type: "string", 
                description: "Treść wiadomości"
              },
              sender_email: {
                type: "string",
                description: "Email nadawcy"
              }
            },
            required: ["subject", "message", "sender_email"]
          }
        }
      }
    ],
    model: "gpt-4o-mini"
  });
}
```

### 2. API Routes

**Plik: `app/api/chat/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAssistant, getOrCreateThread, processMessage } from '@/lib/ai/assistant';
import { checkRateLimit } from '@/lib/chat/rate-limit';
import { validateInput } from '@/lib/chat/security';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  threadId: z.string().optional(),
  locale: z.enum(['pl', 'en']).default('pl')
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const { message, threadId, locale } = ChatRequestSchema.parse(body);

    // Security validation
    const securityCheck = validateInput(message);
    if (!securityCheck.isValid) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Process message with OpenAI
    const result = await processMessage({
      message,
      threadId,
      locale,
      assistantId: process.env.OPENAI_ASSISTANT_ID!
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Function Calling Implementation

**Plik: `lib/ai/functions.ts`**

```typescript
export async function handleFunctionCall(
  functionName: string, 
  args: any
): Promise<string> {
  switch (functionName) {
    case 'book_meeting':
      return await bookMeeting(args);
    case 'send_email':
      return await sendEmail(args);
    default:
      return 'Nieznana funkcja';
  }
}

async function bookMeeting(args: { reason: string; preferred_date?: string }) {
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL;
  
  if (!calendarUrl) {
    return 'Przepraszam, kalendarz nie jest obecnie dostępny.';
  }

  // Log the booking attempt
  console.log('Meeting booking request:', args);

  return `Aby umówić spotkanie, kliknij w link: ${calendarUrl}

Powód: ${args.reason}
${args.preferred_date ? `Preferowana data: ${args.preferred_date}` : ''}

Link otworzy się w nowej karcie.`;
}

async function sendEmail(args: { 
  subject: string; 
  message: string; 
  sender_email: string 
}) {
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Chat Assistant <${process.env.RESEND_FROM_EMAIL}>`,
        to: [process.env.NEXT_PUBLIC_CONTACT_EMAIL!],
        subject: `[Chat] ${args.subject}`,
        html: `
          <h3>Wiadomość z chat asystenta</h3>
          <p><strong>Od:</strong> ${args.sender_email}</p>
          <p><strong>Temat:</strong> ${args.subject}</p>
          <p><strong>Wiadomość:</strong></p>
          <p>${args.message.replace(/\n/g, '<br>')}</p>
        `
      }),
    });

    if (resendResponse.ok) {
      return 'Email został wysłany pomyślnie. Piotr odpowie w ciągu 24 godzin.';
    } else {
      return 'Wystąpił błąd podczas wysyłania emaila. Spróbuj ponownie później.';
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return 'Wystąpił błąd podczas wysyłania emaila.';
  }
}
```

### 4. Chat Widget Component

**Plik: `components/chat/ChatWidget.tsx`**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  locale: 'pl' | 'en';
}

export function ChatWidget({ locale }: ChatWidgetProps) {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId,
          locale
        })
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        if (data.threadId) {
          setThreadId(data.threadId);
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('errorMessage'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            
            <motion.div
              className="relative w-full max-w-md h-[600px]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>{t('welcomeMessage')}</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('typing')}</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('inputPlaceholder')}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 5. Security Implementation

**Plik: `lib/chat/security.ts`**

```typescript
export interface SecurityCheck {
  isValid: boolean;
  threats: string[];
}

export function validateInput(input: string): SecurityCheck {
  const threats: string[] = [];
  
  // Prompt injection patterns
  const promptInjectionPatterns = [
    /ignore\s+previous\s+instructions/i,
    /forget\s+everything/i,
    /you\s+are\s+now/i,
    /pretend\s+to\s+be/i,
    /act\s+as\s+if/i,
    /system\s+prompt/i,
    /jailbreak/i,
    /roleplay/i,
    /new\s+instructions/i,
    /override/i,
    /bypass/i
  ];

  // Check for prompt injection
  for (const pattern of promptInjectionPatterns) {
    if (pattern.test(input)) {
      threats.push('prompt_injection');
    }
  }

  // Check for excessive length
  if (input.length > 1000) {
    threats.push('excessive_length');
  }

  // Check for suspicious characters
  const suspiciousChars = /[<>{}[\]\\|`~]/g;
  if (suspiciousChars.test(input)) {
    threats.push('suspicious_characters');
  }

  // Check for multiple languages (potential confusion)
  const hasPolish = /[ąćęłńóśźż]/i.test(input);
  const hasEnglish = /[a-z]/i.test(input);
  if (hasPolish && hasEnglish && input.length > 50) {
    // Allow mixed languages for short inputs
    threats.push('mixed_languages');
  }

  return {
    isValid: threats.length === 0,
    threats
  };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>{}[\]\\|`~]/g, '') // Remove suspicious characters
    .substring(0, 1000); // Limit length
}
```

### 6. Rate Limiting

**Plik: `lib/chat/rate-limit.ts`**

```typescript
interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
}

// Simple in-memory rate limiting (for MVP)
// In production, use Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 20; // 20 requests per 15 minutes

  const key = `chat:${ip}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      resetTime: current.resetTime,
      remaining: 0
    };
  }

  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count
  };
}
```

## 🌐 Internationalization

### Dodanie tłumaczeń

**Plik: `messages/pl.json` (dodanie sekcji chat)**

```json
{
  "chat": {
    "title": "Asystent Piotra",
    "subtitle": "Zapytaj o doświadczenie i projekty",
    "welcomeMessage": "Cześć! Jestem asystentem Piotra. Mogę odpowiedzieć na pytania o jego doświadczenie, projekty i umiejętności. Jak mogę pomóc?",
    "inputPlaceholder": "Zadaj pytanie...",
    "typing": "Piszę...",
    "errorMessage": "Przepraszam, wystąpił błąd. Spróbuj ponownie.",
    "bookMeeting": "Umów spotkanie",
    "sendEmail": "Wyślij email",
    "functions": {
      "meetingBooked": "Spotkanie zostało umówione",
      "emailSent": "Email został wysłany"
    }
  }
}
```

**Plik: `messages/en.json` (dodanie sekcji chat)**

```json
{
  "chat": {
    "title": "Piotr's Assistant",
    "subtitle": "Ask about experience and projects",
    "welcomeMessage": "Hi! I'm Piotr's assistant. I can answer questions about his experience, projects, and skills. How can I help?",
    "inputPlaceholder": "Ask a question...",
    "typing": "Typing...",
    "errorMessage": "Sorry, an error occurred. Please try again.",
    "bookMeeting": "Book meeting",
    "sendEmail": "Send email",
    "functions": {
      "meetingBooked": "Meeting has been booked",
      "emailSent": "Email has been sent"
    }
  }
}
```

## 🔒 Bezpieczeństwo

### 1. Prompt Injection Protection
- Walidacja wzorców prompt injection
- System instrukcji odporny na manipulację
- Ograniczenie długości wiadomości

### 2. Rate Limiting
- 20 zapytań na 15 minut na IP
- Implementacja w Redis (produkcja)
- Graceful degradation

### 3. Input Validation
- Sanityzacja znaków specjalnych
- Walidacja długości
- Sprawdzanie języków

### 4. GDPR Compliance
- Brak przechowywania danych osobowych
- Logowanie tylko metadanych
- Możliwość usunięcia sesji

## 📊 Monitoring i Analytics

### 1. Logging
```typescript
// Logowanie zapytań (bez treści)
console.log('Chat request', {
  ip: maskedIp,
  timestamp: new Date(),
  messageLength: message.length,
  threadId: threadId?.substring(0, 8)
});
```

### 2. Metrics
- Liczba zapytań dziennie
- Najczęstsze pytania
- Czas odpowiedzi
- Błędy i rate limiting

## 🚀 Deployment

### 1. Environment Variables
```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=asst_xxx

# Existing integrations
NEXT_PUBLIC_CALENDAR_URL=https://cal.com/your-username
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_CONTACT_EMAIL=your-email@domain.com

# Rate limiting (production)
REDIS_URL=your_redis_url
```

### 2. Vercel Configuration
```json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📋 Checklist implementacji

### Faza 1: Podstawy
- [ ] Setup OpenAI Assistant
- [ ] Podstawowy API endpoint `/api/chat`
- [ ] Chat widget UI (floating button + modal)
- [ ] Podstawowa walidacja bezpieczeństwa

### Faza 2: Funkcjonalności
- [ ] Function calling (cal.com + email)
- [ ] Knowledge base (CV, blog posts)
- [ ] Rate limiting
- [ ] Internationalization

### Faza 3: Bezpieczeństwo i optymalizacja
- [ ] Zaawansowana walidacja prompt injection
- [ ] Redis rate limiting
- [ ] Monitoring i logging
- [ ] Testy bezpieczeństwa

### Faza 4: Produkcja
- [ ] Deployment na Vercel
- [ ] Konfiguracja environment variables
- [ ] Monitoring w produkcji
- [ ] Dokumentacja użytkownika

## 💰 Szacowane koszty

### Rozwój
- **Czas implementacji**: 2-3 tygodnie
- **Złożoność**: Średnia

### Operacyjne (miesięcznie)
- **OpenAI API**: $10-50 (w zależności od ruchu)
- **Vercel**: $0 (hobby plan)
- **Redis**: $0-5 (jeśli używany)

### Całkowity koszt: ~$15-55/miesiąc

## 🎯 KPI i metryki sukcesu

1. **Engagement**: Czas spędzony w chacie
2. **Conversion**: Liczba umówionych spotkań przez chat
3. **Satisfaction**: Brak błędów, szybkie odpowiedzi
4. **Security**: Brak udanych ataków prompt injection
5. **Performance**: <2s czas odpowiedzi

---

*Ten plan implementacji zapewnia bezpieczny, skalowalny i funkcjonalny wirtualny asystent zintegrowany z istniejącą architekturą portfolio.*
