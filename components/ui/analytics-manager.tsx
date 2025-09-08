'use client';

import { useEffect, useState } from 'react';
import { Clarity } from '@/components/ui/clarity';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';
import { AnalyticsConsentBanner } from '@/components/ui/analytics-consent-banner';

interface AnalyticsManagerProps {
  clarityProjectId?: string;
  plausibleDomain?: string;
  umamiWebsiteId?: string;
  umamiScriptUrl?: string;
}

export function AnalyticsManager({ 
  clarityProjectId, 
  plausibleDomain, 
  umamiWebsiteId,
  umamiScriptUrl
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
          umamiScriptUrl: Boolean(umamiScriptUrl || process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL) ? '[set]' : '[missing]'
        });
      } catch (_) {}
    }
  }, [clarityProjectId, plausibleDomain, umamiWebsiteId, umamiScriptUrl]);

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

  const resolvedUmamiScriptUrl = umamiScriptUrl || process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://umami.example.com/script.js';

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
          src={`${resolvedUmamiScriptUrl}`}
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
