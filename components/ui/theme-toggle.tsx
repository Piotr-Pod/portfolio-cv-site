'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getIcon = () => {
    return theme === 'light' ? Sun : Moon;
  };

  const Icon = getIcon();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="w-10 h-10 p-0 rounded-full">
        <div className="w-4 h-4 m-3" /> {/* Placeholder to maintain layout */}
      </div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="w-10 h-10 p-0 rounded-full hover:bg-muted transition-colors duration-200"
        aria-label={`Przełącz motyw (obecnie: ${theme === 'light' ? 'jasny' : 'ciemny'})`}
      >
        <Icon className="h-4 w-4 transition-all duration-300" />
      </Button>
    </motion.div>
  );
}
