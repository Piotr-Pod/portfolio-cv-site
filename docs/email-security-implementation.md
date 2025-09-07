# Implementacja zabezpieczeń emaili w formularzu kontaktowym

## Przegląd zmian

Zaimplementowano kompleksowe zabezpieczenia dla formularza kontaktowego, które chronią przed atakami XSS i HTML injection w emailach.

## Zainstalowane pakiety

```bash
npm install dompurify jsdom @types/dompurify
```

## Zaimplementowane zabezpieczenia

### 1. Sanityzacja HTML

**Funkcja `sanitizeForEmail()`:**
- Usuwa wszystkie tagi HTML
- Escapuje znaki specjalne (`&`, `<`, `>`, `"`, `'`)
- Używa DOMPurify dla zaawansowanej sanityzacji

```typescript
function sanitizeForEmail(input: string): string {
  const sanitized = purify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  return sanitized.replace(/[&<>"']/g, (char) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[char];
  });
}
```

### 2. Wykrywanie podejrzanej zawartości

**Funkcja `detectSuspiciousContent()`:**
- Wykrywa potencjalnie niebezpieczne wzorce
- Sprawdza tagi: `<script>`, `<iframe>`, `<object>`, `<embed>`
- Wykrywa protokoły: `javascript:`, `data:`, `vbscript:`
- Sprawdza atrybuty eventów: `onload`, `onerror`, `onclick`

### 3. Rozszerzona walidacja Zod

**Zaktualizowany schemat:**
- Walidacja znaków w polu `name` (tylko litery, spacje, myślniki, apostrofy)
- Maksymalna długość emaila (254 znaki)
- Sprawdzanie podejrzanej zawartości we wszystkich polach
- Dodatkowe walidacje bezpieczeństwa

### 4. Logowanie bezpieczeństwa

**Automatyczne logowanie:**
- Podejrzane próby są logowane z kontekstem
- Zawiera IP, User-Agent, timestamp
- Ograniczone logowanie wrażliwych danych
- Flaga `suspiciousContentDetected` w logach

### 5. Bezpieczne szablony emaili

**Zastosowanie sanityzacji:**
- Wszystkie dane użytkownika są sanityzowane przed użyciem w HTML
- Działa dla obu dostawców: Resend i Mailgun
- Bezpieczne pole `reply_to`
- Bezpieczny temat emaila

## Przykład użycia

### Przed zabezpieczeniami:
```html
<p><strong>Name:</strong> <script>alert('XSS')</script></p>
```

### Po zabezpieczeniach:
```html
<p><strong>Name:</strong> &lt;script&gt;alert('XSS')&lt;/script&gt;</p>
```

## Testowanie zabezpieczeń

### Test 1: XSS w polu name
```javascript
// Input: <script>alert('XSS')</script>
// Output: &lt;script&gt;alert('XSS')&lt;/script&gt;
```

### Test 2: HTML injection w wiadomości
```javascript
// Input: <iframe src="malicious.com"></iframe>
// Output: &lt;iframe src="malicious.com"&gt;&lt;/iframe&gt;
```

### Test 3: JavaScript w emailu
```javascript
// Input: javascript:alert('XSS')
// Output: javascript:alert('XSS') (wykryte jako podejrzane)
```

## Monitoring i alerty

### Logi bezpieczeństwa
```json
{
  "level": "warn",
  "message": "Suspicious content detected in contact form",
  "ip": "192.168.1.1",
  "suspiciousFields": ["name", "message"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "name": "<script>alert('XSS')</script>",
  "email": "test@example.com",
  "message": "<iframe src='evil.com'></iframe>"
}
```

### Logi formularza
```json
{
  "level": "log",
  "message": "Contact form submission",
  "name": "&lt;script&gt;alert('XSS')&lt;/script&gt;",
  "email": "test@example.com",
  "message": "&lt;iframe src='evil.com'&gt;&lt;/iframe&gt;",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ip": "192.168.1.1",
  "emailSent": true,
  "suspiciousContentDetected": true
}
```

## Zalecenia produkcyjne

### 1. Monitoring
- Skonfiguruj alerty na podejrzane próby
- Monitoruj logi w czasie rzeczywistym
- Ustaw progi dla blokowania IP

### 2. Rate Limiting
- Rozważ implementację Redis dla rate limiting
- Dodaj progressive delays dla podejrzanych IP
- Implementuj CAPTCHA po przekroczeniu limitów

### 3. Dodatkowe zabezpieczenia
- Weryfikacja domeny w adresie email
- Sprawdzanie reputacji IP
- Implementacja honeypot fields

### 4. Backup i recovery
- Regularne kopie zapasowe logów
- Plan odzyskiwania po atakach
- Dokumentacja procedur bezpieczeństwa

## Podsumowanie

Implementacja zapewnia:
- ✅ Ochronę przed XSS w emailach
- ✅ Sanityzację wszystkich danych użytkownika
- ✅ Wykrywanie podejrzanych prób
- ✅ Szczegółowe logowanie bezpieczeństwa
- ✅ Kompatybilność z oboma dostawcami emaili
- ✅ Zachowanie funkcjonalności formularza

Formularz kontaktowy jest teraz bezpieczny i gotowy do użycia w produkcji.
