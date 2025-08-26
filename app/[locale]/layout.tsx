import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/lib/theme-provider';
import '@/app/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'CV Portfolio - Backend Engineer',
  description: 'Backend Engineer specializing in Java/Spring, Microservices, and Kafka',
  keywords: ['backend engineer', 'java', 'spring', 'microservices', 'kafka'],
  authors: [{ name: 'Backend Engineer' }],
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
    title: 'CV Portfolio - Backend Engineer',
    description: 'Backend Engineer specializing in Java/Spring, Microservices, and Kafka',
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
            <Navigation />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
