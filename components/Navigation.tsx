 'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const [currentPathname, setCurrentPathname] = useState<string>('/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPathname(window.location.pathname);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const makeLocaleHref = (nextLocale: 'pl' | 'en') => {
    const base = currentPathname || '/';
    return base.replace(/^\/[a-z]{2}(?=\/|$)/, `/${nextLocale}`);
  };

  const navItems = [
    { id: 'hero', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'timeline', label: t('timeline') },
    { id: 'projects', label: t('projects') },
    { id: 'contact', label: t('contact') },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Navigation links */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-foreground hover:text-cyan-500 font-medium transition-colors duration-200 relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-200 group-hover:w-full"></span>
              </motion.button>
            ))}
          </div>

          {/* Right side - Theme toggle + Locale switcher + Scroll to top */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-1 rounded-full bg-muted p-1">
              <Button asChild variant={locale === 'pl' ? 'default' : 'ghost'} size="sm" className="h-8 px-3" aria-pressed={locale === 'pl'}>
                <Link href={makeLocaleHref('pl')} locale="pl">PL</Link>
              </Button>
              <Button asChild variant={locale === 'en' ? 'default' : 'ghost'} size="sm" className="h-8 px-3" aria-pressed={locale === 'en'}>
                <Link href={makeLocaleHref('en')} locale="en">EN</Link>
              </Button>
            </div>

            <motion.button
              onClick={scrollToTop}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUp className="h-5 w-5 group-hover:animate-bounce" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
