import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['pl', 'en'],
  defaultLocale: 'pl'
});

export default async function middleware(request: NextRequest) {
  // Debug logs
  console.log('🔍 Middleware called for:', request.nextUrl.pathname);
  console.log('🔍 Cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`));

  // Block direct access to CV PDF generation endpoint
  if (request.nextUrl.pathname === '/api/cv/pdf') {
    return NextResponse.json(
      { error: 'Direct access not allowed. Use the download button instead.' },
      { status: 403 }
    );
  }

  // Sprawdź autoryzację tylko w środowisku produkcyjnym
  const isProduction = process.env.NODE_ENV === 'production';
  const isProtectedPath = isProduction && 
                         !request.nextUrl.pathname.startsWith('/api/') && 
                         !request.nextUrl.pathname.startsWith('/_next/') &&
                         !request.nextUrl.pathname.startsWith('/_vercel/') &&
                         !request.nextUrl.pathname.includes('/login') &&
                         !request.nextUrl.pathname.includes('.');

  console.log('🔍 Environment:', process.env.NODE_ENV);
  console.log('🔍 Is production:', isProduction);
  console.log('🔍 Is protected path:', isProtectedPath);

  if (isProtectedPath) {
    // Sprawdź czy użytkownik jest zalogowany (cookie)
    const isAuthenticated = request.cookies.get('authenticated')?.value === 'true';
    
    console.log('🔍 Is authenticated:', isAuthenticated);
    
    // Jeśli nie jest zalogowany, przekieruj do logowania
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      // Użyj domyślnego locale (pl) dla strony logowania
      const loginUrl = new URL('/pl/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ Authenticated, continuing...');
  } else if (!isProduction) {
    console.log('🔓 Development mode - authentication disabled');
  }
  
  // Jeśli użytkownik jest zalogowany lub ścieżka nie wymaga autoryzacji, kontynuuj z next-intl
  const response = await intlMiddleware(request);
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://www.clarity.ms https://clarity.ms",
    "script-src-elem 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://www.clarity.ms https://clarity.ms",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://vercel.live https://va.vercel-scripts.com https://www.clarity.ms https://clarity.ms",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Block indexing by all bots at the HTTP header level
  response.headers.set('X-Robots-Tags', 'noindex, nofollow, noarchive, nosnippet');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
