'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const t = useTranslations('navigation');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'hero', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'projects', label: t('projects') },
    { id: 'contact', label: t('contact') },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 ${className}`}
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
                className="text-slate-700 hover:text-cyan-500 font-medium transition-colors duration-200 relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-200 group-hover:w-full"></span>
              </motion.button>
            ))}
          </div>

          {/* Right side - Initials */}
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
    </motion.nav>
  );
}
