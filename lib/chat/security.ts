export interface SecurityCheck {
  isValid: boolean;
  threats: string[];
}

export function validateInput(input: string): SecurityCheck {
  const threats: string[] = [];

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

  for (const pattern of promptInjectionPatterns) {
    if (pattern.test(input)) {
      threats.push('prompt_injection');
    }
  }

  if (input.length > 1000) {
    threats.push('excessive_length');
  }

  const suspiciousChars = /[<>\{}[\]\\|`~]/g;
  if (suspiciousChars.test(input)) {
    threats.push('suspicious_characters');
  }

  const hasPolish = /[ąćęłńóśźż]/i.test(input);
  const hasEnglish = /[a-z]/i.test(input);
  if (hasPolish && hasEnglish && input.length > 50) {
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
    .replace(/[<>\{}[\]\\|`~]/g, '')
    .substring(0, 1000);
}


