import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Navigation } from '@/components/Navigation';
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
  openGraph: {
    title: 'CV Portfolio - Backend Engineer',
    description: 'Backend Engineer specializing in Java/Spring, Microservices, and Kafka',
    type: 'website',
  },
};

const locales = ['pl', 'en'];

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
