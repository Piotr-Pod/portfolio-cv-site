"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CvDownloadSchema, type CvDownloadData } from "@/lib/validators/cv-download";
import { useAnalyticsConsent } from "@/lib/hooks/use-analytics-consent";
import { getOrCreateClientId } from "@/lib/metrics/client";

interface CvDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function CvDownloadModal({ isOpen, onClose, locale }: CvDownloadModalProps) {
  const t = useTranslations('cvDownload');
  const { consent, isLoaded } = useAnalyticsConsent();
  
  const [formData, setFormData] = useState<Partial<CvDownloadData>>({
    gdprConsent: false,
    fullName: '',
    company: '',
    contact: '',
    justification: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CvDownloadData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = CvDownloadSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((error: any) => {
        const field = error.path[0] as string;
        if (field === 'gdprConsent') {
          errors[field] = t('validationErrors.gdprRequired');
        } else if (error.code === 'too_big') {
          errors[field] = t(`validationErrors.${field}TooLong`);
        }
      });
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setShowError(false);
    
    try {
      // Gather session tracking information
      const consentGiven = Boolean(consent && (consent.clarity || consent.plausible || consent.umami));
      const { clientId } = getOrCreateClientId(consentGiven);
      
      // Generate session ID for this request
      const sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      // Prepare request payload with session tracking
      const payload = {
        ...formData,
        locale,
        clientId,
        sessionId,
        analyticsConsent: consent || { clarity: false, plausible: false, umami: false },
      };
      
      const response = await fetch('/api/cv-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Download the CV file
        const cvFileName = `Piotr-Podgorski-CV-${locale}.pdf`;
        const downloadUrl = `/cv/${cvFileName}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = cvFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          // Reset form
          setFormData({
            gdprConsent: false,
            fullName: '',
            company: '',
            contact: '',
            justification: '',
          });
        }, 3000);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('CV download error:', error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={contentVariants}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card rounded-2xl shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">
              {t('modalTitle')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Success State */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 text-center"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('successTitle')}
              </h3>
              <p className="text-muted-foreground">
                {t('successMessage')}
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    {t('errorTitle')}
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {t('errorMessage')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {!showSuccess && (
            <div className="p-6 space-y-6">
              {/* GDPR Consent */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('gdprTitle')}
                </h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    {t('gdprText')}
                  </p>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gdprConsent || false}
                      onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      {t('gdprConsent')}
                    </span>
                  </label>
                  {validationErrors.gdprConsent && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {validationErrors.gdprConsent}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('optionalFieldsTitle')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('optionalFieldsDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">{t('fullNameLabel')}</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className={validationErrors.fullName ? 'border-red-500' : ''}
                    />
                    {validationErrors.fullName && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="company">{t('companyLabel')}</Label>
                    <Input
                      id="company"
                      value={formData.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder={t('companyPlaceholder')}
                      className={validationErrors.company ? 'border-red-500' : ''}
                    />
                    {validationErrors.company && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {validationErrors.company}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact">{t('contactLabel')}</Label>
                  <Input
                    id="contact"
                    value={formData.contact || ''}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder={t('contactPlaceholder')}
                    className={validationErrors.contact ? 'border-red-500' : ''}
                  />
                  {validationErrors.contact && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="justification">{t('justificationLabel')}</Label>
                  <Textarea
                    id="justification"
                    value={formData.justification || ''}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                    placeholder={t('justificationPlaceholder')}
                    rows={3}
                    className={validationErrors.justification ? 'border-red-500' : ''}
                  />
                  {validationErrors.justification && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.justification}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {!showSuccess && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.gdprConsent}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    {t('downloading')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('downloadButton')}
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
