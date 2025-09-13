# CV Download Feature

## Overview

Secure CV download system with GDPR compliance, user consent management, and email notifications for recruitment purposes.

## Features

- **GDPR Compliance**: Full compliance with EU data protection regulations
- **User Consent**: Mandatory consent for data processing with clear terms
- **Optional Fields**: Recruiters can provide additional context
- **Email Notifications**: Automatic notifications sent via Resend/Mailgun
- **Multi-language Support**: Polish and English translations
- **Secure Processing**: Data validation and sanitization

## Components

### 1. CvDownloadModal (`components/CvDownloadModal.tsx`)
Interactive modal component for CV download with:
- GDPR consent form
- Optional recruiter information fields
- Form validation
- Success/error states
- Accessibility features

### 2. API Endpoint (`app/api/cv-download/route.ts`)
Server-side processing:
- Request validation using Zod
- Email sending via Resend/Mailgun
- Request logging for audit trail
- Error handling

### 3. Validation Schema (`lib/validators/cv-download.ts`)
Type-safe validation with:
- Required GDPR consent
- Optional fields with length limits
- Multi-language error messages

## Usage

### Integration
```tsx
import { CvDownloadModal } from '@/components/CvDownloadModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Download CV
      </button>
      
      <CvDownloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        locale="en"
      />
    </>
  );
}
```

### Environment Variables
```env
# Email service (required)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Fallback email service
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Contact email for notifications
NEXT_PUBLIC_CONTACT_EMAIL=your-email@domain.com
```

## GDPR Compliance

### Data Processing
- **Purpose**: Recruitment and candidate evaluation only
- **Duration**: Maximum 3 months from download date
- **Legal Basis**: Explicit consent (Article 6(1)(a) GDPR)
- **Rights**: Users can withdraw consent at any time

### Data Collected
- **Required**: GDPR consent (boolean)
- **Optional**: Full name, company, contact info, justification
- **Technical**: IP address, user agent, timestamp (for security)

### Data Security
- **Input Validation**: Zod schema validation for all fields
- **HTML Sanitization**: DOMPurify removes all HTML tags and escapes special characters
- **Suspicious Content Detection**: Automatic detection of potentially malicious patterns
- **Security Logging**: Suspicious content attempts are logged with IP and timestamp
- **Secure Transmission**: HTTPS only
- **No Persistent Storage**: No personal data stored permanently
- **Email Security**: All user input sanitized before email generation

## Email Notifications

### Enhanced Template Structure
```
Subject: 🔔 CV Download Request - [Warsaw Time]

Content:
- ⏰ Request Details:
  - Download time (Warsaw timezone)
  - UTC timestamp
  - Site language
  - IP address and User Agent
  
- 🔒 Session & Privacy Information:
  - GDPR consent status
  - Analytics tracking services (Clarity, Umami)
  - Client ID (if analytics consent given)
  - Unique session ID for this request

- ⚠️ Security Alert (only if threats detected):
  - Prominent warning about malicious content
  - List of affected form fields
  - Detailed threat descriptions
  - Neutralization confirmation
  - Safety assurance and recommendations
  
- 👤 Recruiter Information:
  - Full name, company, contact (sanitized)
  - Justification for CV download (sanitized)
  
- Security footer with GDPR compliance notice
```

### Security Alert Example
When malicious content is detected, the email includes a section like:
```
⚠️ Security Alert - Malicious Content Detected & Neutralized

IMPORTANT: The system detected potentially malicious code in the submitted form. 
All dangerous content has been automatically sanitized and rendered completely harmless.

📍 Affected fields: fullName, justification
🛡️ Detected threats:
• Script tags (potential XSS)
• onclick event handlers
• iframe elements (potential embedding)

⚡ Action taken: All HTML tags, JavaScript code, event handlers, and suspicious 
patterns have been completely removed or escaped. The content below is 100% safe 
to read and cannot execute any code.

✅ Security Status: All malicious content has been neutralized. You can safely 
review the sanitized information below without any risk of code execution or 
security compromise.
```

### Session Tracking Integration
- **Client ID**: Persistent identifier when user consents to analytics
- **Session ID**: Unique identifier for each download request
- **Analytics Services**: Shows which tracking services are enabled
- **Anonymous Sessions**: Handled gracefully when no analytics consent

### Delivery
1. **Primary**: Resend service
2. **Fallback**: Mailgun service
3. **Error Handling**: Proper error responses if both fail

## Security Implementation

### XSS Protection
The CV download feature implements comprehensive protection against XSS attacks:

```typescript
// All user input is sanitized using DOMPurify
function sanitizeForEmail(input: string): string {
  const sanitized = purify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  return sanitized.replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#039;'
    };
    return map[char];
  });
}
```

### Malicious Content Detection
Automatic detection of suspicious patterns:
- Script tags (`<script>`)
- JavaScript URIs (`javascript:`)
- Event handlers (`onload=`, `onclick=`, etc.)
- Dangerous HTML elements (`<iframe>`, `<object>`, etc.)

### Security Logging & Email Alerts
All suspicious content attempts are logged with:
- Client IP address
- User agent
- Timestamp
- Affected fields
- Detailed list of detected threats
- Truncated content samples
- Security actions taken

When malicious content is detected, the email notification includes:
- **Security Alert Section**: Prominent warning about detected threats
- **Threat Details**: Specific types of malicious patterns found
- **Affected Fields**: Which form fields contained suspicious content
- **Neutralization Confirmation**: Clear statement that all threats have been sanitized
- **Safety Assurance**: Confirmation that the content is now safe to review
- **Recommendations**: Guidance on next steps based on threat assessment

## API Reference

### POST `/api/cv-download`

#### Request Body
```typescript
{
  gdprConsent: boolean;      // Required: true
  fullName?: string;         // Optional: max 100 chars
  company?: string;          // Optional: max 100 chars
  contact?: string;          // Optional: max 100 chars
  justification?: string;    // Optional: max 500 chars
  locale: string;           // Added automatically
}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "CV download request processed successfully"
}
```

**Validation Error (400)**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "details": { /* Zod validation errors */ }
  }
}
```

**Server Error (500)**
```json
{
  "error": {
    "code": "EMAIL_SEND_ERROR",
    "message": "Failed to send notification email"
  }
}
```

## Testing

### Unit Tests
- Component rendering and interaction
- Form validation
- API request handling
- Error states

### Integration Tests
- End-to-end download flow
- Email sending verification
- Error handling

### Accessibility
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

## Security Considerations

1. **Input Validation**: All inputs validated server-side
2. **Rate Limiting**: Can be implemented per IP
3. **CSRF Protection**: Same-origin requests only
4. **Data Minimization**: Only collect necessary data
5. **Audit Trail**: All requests logged with metadata

## Internationalization

Supports multiple languages through next-intl:
- Polish (pl): Default language
- English (en): Full translation support
- Extensible for additional languages

## Performance

- **Lazy Loading**: Modal loaded only when needed
- **Optimized Bundle**: Minimal impact on main bundle
- **Error Boundaries**: Graceful error handling
- **Progressive Enhancement**: Works without JavaScript

## Maintenance

### Monitoring
- Email delivery success rates
- API error rates
- User consent patterns
- Performance metrics

### Updates
- Regular dependency updates
- GDPR compliance reviews
- Security audits
- User experience improvements
