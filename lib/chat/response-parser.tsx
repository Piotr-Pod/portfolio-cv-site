'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ParsedElement {
  type: 'text' | 'link' | 'email' | 'bold' | 'button';
  content: string;
  href?: string;
  action?: () => void;
}

/**
 * Parser odpowiedzi asystenta obsługujący:
 * 1. Linki HTTP/HTTPS -> klikalne linki
 * 2. Adresy email -> klikalne linki mailto:
 * 3. **tekst** -> pogrubiony tekst
 * 4. {contactSection} i {heroSection} -> klikalne przyciski
 */
export function parseAssistantResponse(text: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Sprawdź kolejność: linki, email, przyciski, pogrubienie, zwykły tekst
    const linkMatch = remaining.match(/^https?:\/\/[^\s]+/);
    const emailMatch = remaining.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const buttonMatch = remaining.match(/^\{contactSection\}|^\{heroSection\}/);
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);

    if (linkMatch) {
      // Link HTTP/HTTPS
      const url = linkMatch[0];
      elements.push({
        type: 'link',
        content: url,
        href: url
      });
      remaining = remaining.substring(url.length);
    } else if (emailMatch) {
      // Adres email
      const email = emailMatch[0];
      elements.push({
        type: 'email',
        content: email,
        href: `mailto:${email}`
      });
      remaining = remaining.substring(email.length);
    } else if (buttonMatch) {
      // Przycisk placeholder
      const placeholder = buttonMatch[0];
      elements.push({
        type: 'button',
        content: placeholder,
        action: () => {
          if (placeholder === '{contactSection}') {
            // Sprawdź czy jesteśmy na stronie głównej
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              // Jesteśmy na stronie głównej - przewiń do sekcji kontakt
              contactSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              // Nie jesteśmy na stronie głównej - przejdź do strony głównej z sekcją kontakt
              const currentPath = window.location.pathname;
              const locale = currentPath.split('/')[1] || 'pl';
              window.location.href = `/${locale}#contact`;
            }
          } else if (placeholder === '{heroSection}') {
            // Sprawdź czy jesteśmy na stronie głównej
            const heroSection = document.getElementById('hero');
            if (heroSection) {
              // Jesteśmy na stronie głównej - przewiń do sekcji hero
              heroSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              // Nie jesteśmy na stronie głównej - przejdź do strony głównej z sekcją hero
              const currentPath = window.location.pathname;
              const locale = currentPath.split('/')[1] || 'pl';
              window.location.href = `/${locale}#hero`;
            }
          }
        }
      });
      remaining = remaining.substring(placeholder.length);
    } else if (boldMatch) {
      // Pogrubiony tekst
      const boldText = boldMatch[1];
      elements.push({
        type: 'bold',
        content: boldText
      });
      remaining = remaining.substring(boldMatch[0].length);
    } else {
      // Zwykły tekst - znajdź najbliższy specjalny element
      let nextSpecialIndex = remaining.length;
      let nextSpecialType: 'link' | 'email' | 'button' | 'bold' | null = null;

      // Sprawdź linki
      const linkIndex = remaining.search(/https?:\/\/[^\s]+/);
      if (linkIndex !== -1 && linkIndex < nextSpecialIndex) {
        nextSpecialIndex = linkIndex;
        nextSpecialType = 'link';
      }

      // Sprawdź email
      const emailIndex = remaining.search(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailIndex !== -1 && emailIndex < nextSpecialIndex) {
        nextSpecialIndex = emailIndex;
        nextSpecialType = 'email';
      }

      // Sprawdź przyciski
      const buttonIndex = remaining.search(/\{contactSection\}|\{heroSection\}/);
      if (buttonIndex !== -1 && buttonIndex < nextSpecialIndex) {
        nextSpecialIndex = buttonIndex;
        nextSpecialType = 'button';
      }

      // Sprawdź pogrubienie
      const boldIndex = remaining.search(/\*\*[^*]+\*\*/);
      if (boldIndex !== -1 && boldIndex < nextSpecialIndex) {
        nextSpecialIndex = boldIndex;
        nextSpecialType = 'bold';
      }

      if (nextSpecialType) {
        // Dodaj tekst przed specjalnym elementem
        const textContent = remaining.substring(0, nextSpecialIndex);
        if (textContent) {
          elements.push({
            type: 'text',
            content: textContent
          });
        }
        remaining = remaining.substring(nextSpecialIndex);
      } else {
        // Dodaj pozostały tekst
        elements.push({
          type: 'text',
          content: remaining
        });
        remaining = '';
      }
    }
  }

  return elements;
}

/**
 * Komponent renderujący sparsowaną odpowiedź asystenta
 */
export function ParsedResponse({ text, locale }: { text: string; locale: 'pl' | 'en' }) {
  const elements = parseAssistantResponse(text);

  return (
    <>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'link':
            return (
              <a
                key={index}
                href={element.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {element.content}
              </a>
            );
          
          case 'email':
            return (
              <a
                key={index}
                href={element.href}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {element.content}
              </a>
            );
          
          case 'bold':
            return (
              <strong key={index} className="font-semibold">
                {element.content}
              </strong>
            );
          
          case 'button':
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={element.action}
                className="inline-flex items-center gap-1 mx-1 my-1"
              >
                {element.content === '{contactSection}' 
                  ? (locale === 'pl' ? 'Kontakt' : 'Contact')
                  : (locale === 'pl' ? 'Strona główna' : 'Home')
                }
              </Button>
            );
          
          case 'text':
          default:
            return <span key={index}>{element.content}</span>;
        }
      })}
    </>
  );
}
