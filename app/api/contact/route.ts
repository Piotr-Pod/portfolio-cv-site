import { NextResponse } from 'next/server';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

export async function POST(req: Request) {
  try {
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

    const { name, email, message } = parsed.data;

    // TODO: Implement email sending via Resend or Mailgun
    // For now, just log the contact form data
    console.log('Contact form submission:', {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
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
