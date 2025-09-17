import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

import { Navigation } from '@/components/Navigation';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { ScrollRestoration } from '@/components/ScrollRestoration';
import { ThemeProvider } from '@/lib/theme-provider';
import { AnalyticsManager } from '@/components/ui/analytics-manager';
import '@/app/globals.css';
import { ChatWidget } from '@/components/chat/ChatWidget';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Piotr Podgórski - Senior Java Developer | AI Enthusiast',
  description: 'Senior Java Developer with 8 years of experience in enterprise systems, Spring Boot, microservices, and AI integration. Currently working at PKO BP on IKO mobile app replatforming.',
  keywords: ['senior java developer', 'spring boot', 'microservices', 'ai', 'chatgpt', 'llm', 'enterprise', 'pko bp', 'iko'],
  authors: [{ name: 'Piotr Podgórski' }],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'noarchive': true,
      'nosnippet': true
    }
  },
  openGraph: {
    title: 'Piotr Podgórski - Senior Java Developer | AI Enthusiast',
    description: 'Senior Java Developer with 8 years of experience in enterprise systems, Spring Boot, microservices, and AI integration.',
    type: 'website',
  },
};

const locales = ['pl', 'en'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
          <NextIntlClientProvider messages={messages}>
            <ScrollRestoration />
            <Navigation />
            {children}
            <ScrollToTopButton />
            <AnalyticsManager
              clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
              umamiWebsiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              umamiScriptUrl={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            />
            <ChatWidget locale={locale as 'pl' | 'en'} />
          </NextIntlClientProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
