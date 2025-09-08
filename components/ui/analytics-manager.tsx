'use client';

import { useEffect, useState } from 'react';
import { Clarity } from '@/components/ui/clarity';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';
import { AnalyticsConsentBanner } from '@/components/ui/analytics-consent-banner';
import Script from 'next/script';

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
  }, [clarityProjectId, plausibleDomain, umamiWebsiteId, umamiScriptUrl]);

  useEffect(() => {
    // Show banner if consent hasn't been given yet
    if (isLoaded && consent === null) {
      setShowBanner(true);
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
        <Script
          id="umami-script"
          src={`${resolvedUmamiScriptUrl}`}
          strategy="afterInteractive"
          data-website-id={umamiWebsiteId}
          data-auto-track="true"
          onLoad={() => {}}
          onError={(e) => {
            try {
              // eslint-disable-next-line no-console
              console.error('Umami: script failed to load', { src: resolvedUmamiScriptUrl, error: e });
            } catch (_) {}
          }}
        />
      )}

      {/* Consent Banner */}
      {showBanner && (
        <AnalyticsConsentBanner onClose={() => setShowBanner(false)} />
      )}
    </>
  );
}
