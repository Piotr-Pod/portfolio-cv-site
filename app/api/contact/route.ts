import { NextResponse } from 'next/server';
import { z } from 'zod';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = new Date().getTime();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  csrfToken: z.string().min(1, 'CSRF token is required'),
});

export async function POST(req: Request) {
  try {
    // Rate limiting based on IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'Too many requests. Please try again later.' 
          } 
        },
        { status: 429 }
      );
    }

    // CSRF protection - check origin
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    
    // In production, validate against your domain
    if (origin && !origin.includes('localhost') && !origin.includes('yourdomain.com')) {
      return NextResponse.json(
        { 
          error: { 
            code: 'CSRF_ERROR', 
            message: 'Invalid origin' 
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
            message: 'Invalid JSON payload' 
          } 
        },
        { status: 400 }
      );
    }

    const parsed = ContactSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid payload', 
            details: parsed.error.flatten() 
          } 
        },
        { status: 400 }
      );
    }

    const { name, email, message, csrfToken } = parsed.data;

    // TODO: Implement proper CSRF token validation
    // For now, just check if token exists
    if (!csrfToken) {
      return NextResponse.json(
        { 
          error: { 
            code: 'CSRF_ERROR', 
            message: 'Invalid CSRF token' 
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
            message: 'Contact email not configured' 
          } 
        },
        { status: 500 }
      );
    }

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
            from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
            to: [contactEmail],
            subject: `New contact form message from ${name}`,
            html: `
              <h2>New Contact Form Message</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Sent from your website contact form at ${new Date().toISOString()}</small></p>
            `,
            reply_to: email,
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
            subject: `New contact form message from ${name}`,
            html: `
              <h2>New Contact Form Message</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Sent from your website contact form at ${new Date().toISOString()}</small></p>
            `,
            'h:Reply-To': email,
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

    // Log contact form data for debugging
    console.log('Contact form submission:', {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      ip,
      emailSent,
    });

    if (!emailSent) {
      console.warn('No email service configured or email sending failed');
      // Still return success to user, but log the issue
    }

    return NextResponse.json({ 
      success: true,
      message: 'Contact form submitted successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
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
