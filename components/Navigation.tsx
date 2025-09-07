 'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  const [currentPathname, setCurrentPathname] = useState<string>('/');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentPathname(window.location.pathname);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (!mounted) return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const makeLocaleHref = (nextLocale: 'pl' | 'en') => {
    const base = currentPathname || '/';
    return base.replace(/^\/[a-z]{2}(?=\/|$)/, `/${nextLocale}`);
  };

  const handleLocaleChange = (nextLocale: 'pl' | 'en') => {
    if (!mounted || nextLocale === locale) return;
    
    // Zapisz aktualną pozycję scroll
    const scrollPosition = window.scrollY;
    sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    
    // Przejdź do nowej strony z nowym językiem
    const newHref = makeLocaleHref(nextLocale);
    router.push(newHref);
  };

  const navItems = [
    { id: 'hero', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'timeline', label: t('timeline') },
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
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
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

          {/* Mobile Navigation - Visible only on mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.id}>
                      <motion.button
                        onClick={() => scrollToSection(item.id)}
                        className="text-left text-foreground hover:text-cyan-500 font-medium transition-colors duration-200 py-2 px-1 border-b border-border/50"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.label}
                      </motion.button>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side - Theme toggle + Locale switcher */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="flex items-center gap-1 rounded-full bg-muted p-1">
              <Button 
                variant={locale === 'pl' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3" 
                aria-pressed={locale === 'pl'}
                onClick={() => handleLocaleChange('pl')}
              >
                PL
              </Button>
              <Button 
                variant={locale === 'en' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3" 
                aria-pressed={locale === 'en'}
                onClick={() => handleLocaleChange('en')}
              >
                EN
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
