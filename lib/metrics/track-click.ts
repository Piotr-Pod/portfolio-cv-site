'use client';

import { fireAndForget, getOrCreateClientId } from '@/lib/metrics/client';
import type { ClickType } from '@/lib/metrics/repository';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';

export function useTrackClick(postId: string) {
  const { consent, isLoaded } = useAnalyticsConsent();

  function trackClick(type: ClickType, meta?: Record<string, unknown>) {
    if (!isLoaded) return;
    const consentGiven = Boolean(consent);
    const { clientId } = getOrCreateClientId(consentGiven);
    fireAndForget('/api/track-click', { postId, type, meta, clientId });
  }

  return { trackClick };
}


