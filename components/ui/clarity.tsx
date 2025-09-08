'use client';

import { useEffect } from 'react';

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
  enabled?: boolean;
}

export function Clarity({ projectId, enabled = true }: ClarityProps) {
  useEffect(() => {
    // Don't load Clarity if disabled or no project ID
    if (!enabled || !projectId || typeof window === 'undefined') {
      return;
    }

    // Don't load Clarity on localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return;
    }

    // Check if Clarity is already loaded
    if (window.clarity) {
      return;
    }

    // Official Microsoft Clarity initialization code
    (function(c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; 
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      } else {
        // Fallback: append to head if no script tag found
        l.head.appendChild(t);
      }
    })(window, document, "clarity", "script", projectId);


    // Cleanup function
    return () => {
      // Note: Clarity doesn't provide a cleanup method
    };
  }, [projectId, enabled]);

  return null;
}
