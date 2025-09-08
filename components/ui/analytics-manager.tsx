'use client';

import { useEffect, useState } from 'react';
import { Clarity } from '@/components/ui/clarity';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';
import { AnalyticsConsentBanner } from '@/components/ui/analytics-consent-banner';

interface AnalyticsManagerProps {
  clarityProjectId?: string;
  plausibleDomain?: string;
  umamiWebsiteId?: string;
}

export function AnalyticsManager({ 
  clarityProjectId, 
  plausibleDomain, 
  umamiWebsiteId 
}: AnalyticsManagerProps) {
  const { consent, isLoaded } = useAnalyticsConsent();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Diagnostic logs for verifying on Vercel
    if (typeof window !== 'undefined') {
      try {
        // eslint-disable-next-line no-console
        console.log('AnalyticsManager: init', {
          env: process.env.NODE_ENV,
          hostname: window.location.hostname,
          clarityProjectId: Boolean(clarityProjectId) ? '[set]' : '[missing]',
          plausibleDomain: Boolean(plausibleDomain) ? '[set]' : '[missing]',
          umamiWebsiteId: Boolean(umamiWebsiteId) ? '[set]' : '[missing]',
        });
      } catch (_) {}
    }
  }, [clarityProjectId, plausibleDomain, umamiWebsiteId]);

  useEffect(() => {
    // Show banner if consent hasn't been given yet
    if (isLoaded && consent === null) {
      setShowBanner(true);
    }
    if (isLoaded) {
      try {
        // eslint-disable-next-line no-console
        console.log('AnalyticsManager: consent state', consent);
      } catch (_) {}
    }
  }, [isLoaded, consent]);

  // Don't render anything until consent is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {/* Microsoft Clarity */}
      {consent?.clarity && clarityProjectId && (
        <Clarity 
          projectId={clarityProjectId}
          enabled={true}
        />
      )}

      {/* Plausible Analytics */}
      {consent?.plausible && plausibleDomain && (
        <script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
        />
      )}

      {/* Umami Analytics */}
      {consent?.umami && umamiWebsiteId && (
        <script
          defer
          src={`https://umami.example.com/script.js`}
          data-website-id={umamiWebsiteId}
        />
      )}

      {/* Consent Banner */}
      {showBanner && (
        <AnalyticsConsentBanner onClose={() => setShowBanner(false)} />
      )}
    </>
  );
}
