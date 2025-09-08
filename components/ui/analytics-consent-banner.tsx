'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Check, X as XIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';

interface AnalyticsConsentBannerProps {
  onClose?: () => void;
}

export function AnalyticsConsentBanner({ onClose }: AnalyticsConsentBannerProps) {
  const t = useTranslations('analyticsConsent');
  const { consent, isLoaded, updateConsent, acceptAll, rejectAll } = useAnalyticsConsent();
  const [showDetails, setShowDetails] = useState(false);

  if (!isLoaded) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
    onClose?.();
  };

  const handleRejectAll = () => {
    rejectAll();
    onClose?.();
  };

  const handleSavePreferences = () => {
    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Image src="/images/cookie.svg" alt="cookie" width={28} height={28} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('title')}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {t('intro')}
              </p>

              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 mb-4"
                >
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{t('details.clarity.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{t('details.clarity.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.clarity ?? false}
                        onChange={(e) => updateConsent({ clarity: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{t('details.plausible.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{t('details.plausible.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.plausible ?? false}
                        onChange={(e) => updateConsent({ plausible: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAcceptAll}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {t('buttons.acceptAll')}
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  size="sm"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  {t('buttons.rejectAll')}
                </Button>
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showDetails ? t('buttons.hideDetails') : t('buttons.showDetails')}
                </Button>
                {showDetails && (
                  <Button
                    onClick={handleSavePreferences}
                    variant="outline"
                    size="sm"
                  >
                    {t('buttons.savePreferences')}
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
