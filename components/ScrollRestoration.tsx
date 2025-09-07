'use client';

import { useEffect } from 'react';

export function ScrollRestoration() {
  useEffect(() => {
    // Przywróć pozycję scroll po załadowaniu strony
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      const scrollPosition = parseInt(savedScrollPosition, 10);
      // Użyj setTimeout aby upewnić się, że strona jest w pełni załadowana
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        // Usuń zapisaną pozycję po przywróceniu
        sessionStorage.removeItem('scrollPosition');
      }, 100);
    }
  }, []);

  return null;
}
