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
    // Show banner if consent hasn't been given yet
    if (isLoaded && consent === null) {
      setShowBanner(true);
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
          config={{
            sessionReplay: true,
            heatmap: true,
            delay: 1000,
          }}
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
