import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.SITE_PASSWORD;
    
    if (!correctPassword) {
      console.error('SITE_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }
    
    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      
      // Ustaw cookie autoryzacji
      response.cookies.set('authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 dni
      });
      
      return response;
    }
    
    return NextResponse.json(
      { error: 'Invalid password' }, 
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
