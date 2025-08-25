import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['pl', 'en'],
  defaultLocale: 'pl'
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  // Block indexing by all bots at the HTTP header level
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
