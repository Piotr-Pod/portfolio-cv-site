'use client';

import { useEffect } from 'react';

export function HashHandler() {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          // Małe opóźnienie, aby upewnić się, że strona się załadowała
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    // Obsłuż hash przy załadowaniu strony
    handleHashChange();

    // Obsłuż zmiany hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return null;
}
