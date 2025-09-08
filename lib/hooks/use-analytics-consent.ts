'use client';

import { useState, useEffect } from 'react';

interface AnalyticsConsent {
  clarity: boolean;
  plausible: boolean;
  umami: boolean;
}

const CONSENT_STORAGE_KEY = 'analytics-consent';

export function useAnalyticsConsent() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load consent from localStorage
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setConsent(parsed);
      } catch (error) {
        console.warn('Failed to parse stored analytics consent:', error);
        setConsent(null); // No consent given yet
      }
    } else {
      setConsent(null); // No consent given yet
    }
    setIsLoaded(true);
  }, []);

  const updateConsent = (newConsent: Partial<AnalyticsConsent>) => {
    const currentConsent = consent || { clarity: false, plausible: false, umami: false };
    const updatedConsent = { ...currentConsent, ...newConsent };
    setConsent(updatedConsent);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsent));
  };

  const acceptAll = () => {
    updateConsent({
      clarity: true,
      plausible: true,
      umami: true,
    });
  };

  const rejectAll = () => {
    updateConsent({
      clarity: false,
      plausible: false,
      umami: false,
    });
  };

  return {
    consent,
    isLoaded,
    updateConsent,
    acceptAll,
    rejectAll,
  };
}
