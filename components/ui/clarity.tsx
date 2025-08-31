'use client';

import { useEffect } from 'react';

interface ClarityConfig {
  projectId: string;
  upload?: string;
  delay?: number;
  cookieDomain?: string;
  sessionReplay?: boolean;
  heatmap?: boolean;
}

declare global {
  interface Window {
    clarity?: {
      (command: string, ...args: any[]): void;
      q?: any[];
    };
  }
}

interface ClarityProps {
  projectId: string;
  config?: Partial<ClarityConfig>;
}

export function Clarity({ projectId, config = {} }: ClarityProps) {
  useEffect(() => {
    if (!projectId || typeof window === 'undefined') {
      return;
    }

    // Load Clarity script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/' + projectId;

    // Configure Clarity
    const clarityConfig: ClarityConfig = {
      projectId,
      upload: 'https://c.clarity.ms/collect',
      delay: 1000,
      cookieDomain: window.location.hostname,
      sessionReplay: true,
      heatmap: true,
      ...config,
    };

    // Initialize Clarity
    window.clarity = function(command: string, ...args: any[]) {
      if (window.clarity && window.clarity.q) {
        window.clarity.q.push([command, ...args]);
      }
    };
    window.clarity.q = [];

    // Set configuration
    window.clarity('consent');
    window.clarity('set', 'clarity_config', clarityConfig);

    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [projectId, config]);

  return null;
}
