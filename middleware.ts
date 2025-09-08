import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['pl', 'en'],
  defaultLocale: 'pl'
});

export default async function middleware(request: NextRequest) {
  // Debug logs
  


  // Sprawdź autoryzację tylko w środowisku produkcyjnym
  const isProduction = process.env.NODE_ENV === 'production';
  const isProtectedPath = isProduction && 
                         !request.nextUrl.pathname.startsWith('/api/') && 
                         !request.nextUrl.pathname.startsWith('/_next/') &&
                         !request.nextUrl.pathname.startsWith('/_vercel/') &&
                         !request.nextUrl.pathname.includes('/login') &&
                         !request.nextUrl.pathname.includes('.');

  

  if (isProtectedPath) {
    // Sprawdź czy użytkownik jest zalogowany (cookie)
    const isAuthenticated = request.cookies.get('authenticated')?.value === 'true';
    
    
    
    // Jeśli nie jest zalogowany, przekieruj do logowania
    if (!isAuthenticated) {
      
      // Użyj domyślnego locale (pl) dla strony logowania
      const loginUrl = new URL('/pl/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    
  } else if (!isProduction) {
    
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
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://www.clarity.ms https://clarity.ms https://scripts.clarity.ms" + (process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ? ` ${new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin}` : ''),
    "script-src-elem 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://www.clarity.ms https://clarity.ms https://scripts.clarity.ms" + (process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ? ` ${new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin}` : ''),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://vercel.live https://va.vercel-scripts.com https://www.clarity.ms https://clarity.ms https://scripts.clarity.ms https://k.clarity.ms https://api-gateway.umami.dev" + (process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ? ` ${new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin}` : ''),
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
