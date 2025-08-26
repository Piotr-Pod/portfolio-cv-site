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

    // TODO: Implement email sending via Resend or Mailgun
    // For now, just log the contact form data
    console.log('Contact form submission:', {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      ip,
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
