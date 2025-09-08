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
        try {
          // Diagnostic logs for verifying on Vercel
          // eslint-disable-next-line no-console
          console.log('AnalyticsConsent: loaded from localStorage', {
            consent: parsed,
            env: process.env.NODE_ENV,
            hostname: typeof window !== 'undefined' ? window.location.hostname : 'n/a',
          });
        } catch (_) {
          // ignore logging failures
        }
      } catch (error) {
        console.warn('Failed to parse stored analytics consent:', error);
        setConsent(null); // No consent given yet
      }
    } else {
      setConsent(null); // No consent given yet
      try {
        // eslint-disable-next-line no-console
        console.log('AnalyticsConsent: no stored consent', {
          env: process.env.NODE_ENV,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'n/a',
        });
      } catch (_) {}
    }
    setIsLoaded(true);
  }, []);

  const updateConsent = (newConsent: Partial<AnalyticsConsent>) => {
    const currentConsent = consent || { clarity: false, plausible: false, umami: false };
    const updatedConsent = { ...currentConsent, ...newConsent };
    setConsent(updatedConsent);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsent));
    try {
      // eslint-disable-next-line no-console
      console.log('AnalyticsConsent: updated', {
        consent: updatedConsent,
        env: process.env.NODE_ENV,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'n/a',
      });
    } catch (_) {}
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
