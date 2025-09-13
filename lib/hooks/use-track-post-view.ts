'use client';

import { useEffect } from 'react';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';
import { fireAndForget, getOrCreateClientId, rememberAnonView } from '@/lib/metrics/client';

export function useTrackPostView(postId: string | undefined) {
  const { consent, isLoaded } = useAnalyticsConsent();

  useEffect(() => {
    if (!isLoaded) return;
    if (!postId) return;

    const consentGiven = Boolean(consent && (consent.clarity || consent.umami));
    const { clientId } = getOrCreateClientId(consentGiven);

    if (!clientId) {
      // anonymous; avoid spamming within same session for same post
      const already = rememberAnonView(postId);
      if (already) return;
    }

    fireAndForget('/api/track-view', { postId, clientId });
  }, [isLoaded, consent, postId]);
}


