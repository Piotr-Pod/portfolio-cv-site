import { NextResponse } from 'next/server';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { getTranslations } from 'next-intl/server';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute

// Function to get translations based on locale from request
async function getContactTranslations(req: Request) {
  try {
    // Extract locale from URL or headers
    const url = new URL(req.url);
    const pathname = url.pathname;
    const locale = pathname.split('/')[1] || 'en'; // Default to 'en' if no locale
    
    // Validate locale
    const validLocales = ['pl', 'en'];
    const finalLocale = validLocales.includes(locale) ? locale : 'en';
    
    const t = await getTranslations({ locale: finalLocale, namespace: 'contact' });
    return t;
  } catch (error) {
    console.error('Error getting translations:', error);
    // Fallback to English
    const t = await getTranslations({ locale: 'en', namespace: 'contact' });
    return t;
  }
}

// Configure DOMPurify for Node.js environment
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// HTML sanitization function for email content
function sanitizeForEmail(input: string): string {
  // Remove all HTML tags and escape special characters
  const sanitized = purify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Additional escape for any remaining special characters
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

// Function to detect potentially malicious content
function detectSuspiciousContent(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<style/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = new Date().getTime();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true };
}

// Contact schema will be created inside POST function with translations

export async function POST(req: Request) {
  try {
    // Get translations for the request
    const t = await getContactTranslations(req);
    
    // Rate limiting based on IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime!;
      const now = new Date().getTime();
      const waitTimeSeconds = Math.ceil((resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: t('errors.api.rateLimitExceeded'),
            details: {
              waitTimeSeconds,
              resetTime: new Date(resetTime).toISOString()
            }
          } 
        },
        { status: 429 }
      );
    }

    // CSRF protection - check origin
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    
    // In production, validate against your domain
    // Prefer private APP_DOMAIN; fallback to legacy NEXT_PUBLIC_DOMAIN for backward compatibility
    const allowedDomain = process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
    if (origin && !origin.includes('localhost') && !origin.includes(allowedDomain)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'CSRF_ERROR', 
            message: t('errors.api.invalidOrigin')
          } 
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_JSON', 
            message: t('errors.api.invalidJson')
          } 
        },
        { status: 400 }
      );
    }

    // Create contact schema with translations
    const ContactSchema = z.object({
      name: z.string()
        .min(2, t('errors.validation.nameMinLength'))
        .max(80, t('errors.validation.nameMaxLength'))
        .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'\.]+$/, t('errors.validation.nameInvalidChars'))
        .refine((val) => !detectSuspiciousContent(val), t('errors.validation.nameDangerousContent')),
      email: z.string()
        .email(t('errors.validation.emailInvalid'))
        .max(254, t('errors.validation.emailTooLong'))
        .refine((val) => !detectSuspiciousContent(val), t('errors.validation.emailDangerousContent')),
      message: z.string()
        .min(10, t('errors.validation.messageMinLength'))
        .max(2000, t('errors.validation.messageMaxLength'))
        .refine((val) => !detectSuspiciousContent(val), t('errors.validation.messageDangerousContent')),
      csrfToken: z.string().min(1, t('errors.validation.csrfRequired')),
    }).strict(); // Strict mode prevents additional fields

    const parsed = ContactSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: t('errors.api.invalidPayload'), 
            details: parsed.error.flatten() 
          } 
        },
        { status: 400 }
      );
    }

    // Security: Check for suspicious fields that might indicate email target manipulation
    const emailTargetFields = ['to', 'recipient', 'target', 'destination', 'sendTo'];
    const hasEmailTargetFields = emailTargetFields.some(field => field in body);
    
    if (hasEmailTargetFields) {
      console.warn('Suspicious email target manipulation attempt:', {
        ip,
        userAgent: req.headers.get('user-agent'),
        suspiciousFields: emailTargetFields.filter(field => field in body),
        timestamp: new Date().toISOString(),
        bodyKeys: Object.keys(body)
      });
      
      return NextResponse.json(
        { 
          error: { 
            code: 'SECURITY_ERROR', 
            message: t('errors.api.suspiciousPayload')
          } 
        },
        { status: 403 }
      );
    }

    const { name, email, message, csrfToken } = parsed.data;

    // Check for suspicious content and log if detected
    const suspiciousFields = [];
    if (detectSuspiciousContent(name)) suspiciousFields.push('name');
    if (detectSuspiciousContent(email)) suspiciousFields.push('email');
    if (detectSuspiciousContent(message)) suspiciousFields.push('message');

    if (suspiciousFields.length > 0) {
      console.warn('Suspicious content detected in contact form:', {
        ip,
        suspiciousFields,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        name: name.substring(0, 50) + (name.length > 50 ? '...' : ''),
        email: email.substring(0, 50) + (email.length > 50 ? '...' : ''),
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      });
    }

    // TODO: Implement proper CSRF token validation
    // For now, just check if token exists
    if (!csrfToken) {
      return NextResponse.json(
        { 
          error: { 
            code: 'CSRF_ERROR', 
            message: t('errors.api.invalidCsrfToken')
          } 
        },
        { status: 403 }
      );
    }

    // Send email via Resend or Mailgun
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    if (!contactEmail) {
      console.error('NEXT_PUBLIC_CONTACT_EMAIL is not configured');
      return NextResponse.json(
        { 
          error: { 
            code: 'CONFIGURATION_ERROR', 
            message: t('errors.api.contactEmailNotConfigured')
          } 
        },
        { status: 500 }
      );
    }

    // Security: Validate that contactEmail is properly configured and not manipulated
    const allowedContactEmails = [
      process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      'piotr.podgorski.software@gmail.com' // Fallback email
    ].filter(Boolean);

    if (!allowedContactEmails.includes(contactEmail)) {
      console.error('Unauthorized contact email attempt:', {
        attemptedEmail: contactEmail,
        ip,
        userAgent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { 
          error: { 
            code: 'SECURITY_ERROR', 
            message: t('errors.api.unauthorizedEmailTarget')
          } 
        },
        { status: 403 }
      );
    }

    // Sanitize all user input for email content
    const safeName = sanitizeForEmail(name);
    const safeEmail = sanitizeForEmail(email);
    const safeMessage = sanitizeForEmail(message);

    // Try Resend first, then fallback to Mailgun
    let emailSent = false;
    
    // Resend implementation
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `Formularz SANTRUM <${process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev'}>`,
            to: [contactEmail],
            subject: `Contact from ${safeName}`,
            html: `
              <h2>New Contact Form Message</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Message:</strong></p>
              <p>${safeMessage.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Sent from your website contact form at ${new Date().toISOString()}</small></p>
            `,
            reply_to: safeEmail,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          console.log('Email sent successfully via Resend');
        } else {
          console.error('Resend API error:', await resendResponse.text());
        }
      } catch (error) {
        console.error('Resend error:', error);
      }
    }

    // Mailgun fallback
    if (!emailSent && process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      try {
        const mailgunResponse = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            from: `noreply@${process.env.MAILGUN_DOMAIN}`,
            to: contactEmail,
            subject: `New contact form message from ${safeName}`,
            html: `
              <h2>New Contact Form Message</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Message:</strong></p>
              <p>${safeMessage.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Sent from your website contact form at ${new Date().toISOString()}</small></p>
            `,
            'h:Reply-To': safeEmail,
          }),
        });

        if (mailgunResponse.ok) {
          emailSent = true;
          console.log('Email sent successfully via Mailgun');
        } else {
          console.error('Mailgun API error:', await mailgunResponse.text());
        }
      } catch (error) {
        console.error('Mailgun error:', error);
      }
    }

    // Log contact form data for debugging (using sanitized data)
    console.log('Contact form submission:', {
      name: safeName,
      email: safeEmail,
      message: safeMessage.substring(0, 100) + (safeMessage.length > 100 ? '...' : ''),
      timestamp: new Date().toISOString(),
      ip,
      emailSent,
      suspiciousContentDetected: suspiciousFields.length > 0,
    });

    if (!emailSent) {
      console.warn('No email service configured or email sending failed');
      // Still return success to user, but log the issue
    }

    return NextResponse.json({ 
      success: true,
      message: t('errors.api.contactFormSubmitted')
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Try to get translations for error message, fallback to English if fails
    try {
      const t = await getContactTranslations(req);
      return NextResponse.json(
        { 
          error: { 
            code: 'INTERNAL_ERROR', 
            message: t('errors.api.internalError')
          } 
        },
        { status: 500 }
      );
    } catch (translationError) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INTERNAL_ERROR', 
            message: 'Internal server error' 
          } 
        },
        { status: 500 }
      );
    }
  }
}
