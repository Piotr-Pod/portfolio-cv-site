'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Calendar, Send, CheckCircle, XCircle, SendHorizonal } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ContactForm {
  name: string;
  email: string;
  message: string;
  csrfToken: string;
}

export function ContactSection() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
    csrfToken: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);

  // Generate CSRF token on component mount
  useEffect(() => {
    setMounted(true);
    
    const generateCSRFToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
    
    setFormData(prev => ({
      ...prev,
      csrfToken: generateCSRFToken(),
    }));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '', csrfToken: formData.csrfToken });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarClick = () => {
    if (!mounted) return;
    const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL;
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    } else {
      console.error('NEXT_PUBLIC_CALENDAR_URL is not configured');
    }
  };

  const handleEmailClick = () => {
    if (!mounted) return;
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    if (contactEmail) {
      window.location.href = `mailto:${contactEmail}`;
    } else {
      console.error('NEXT_PUBLIC_CONTACT_EMAIL is not configured');
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('description')}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-1">
              {t('descriptionAdditional')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <div className="bg-card rounded-2xl p-8 shadow-md border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {t('formTitle')}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-foreground mb-2 block">
                      {t('nameLabel')}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('namePlaceholder')}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground mb-2 block">
                      {t('emailLabel')}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('emailPlaceholder')}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground mb-2 block">
                      {t('messageLabel')}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('messagePlaceholder')}
                      required
                      rows={5}
                      className="w-full resize-none"
                    />
                  </div>

                  {/* Hidden CSRF token field */}
                  <input
                    type="hidden"
                    name="csrfToken"
                    value={formData.csrfToken}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t('sending')}
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        {t('sendButton')}
                      </>
                    )}
                  </Button>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700"
                    >
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="font-medium">{t('successMessage')}</span>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
                    >
                      <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="font-medium">{t('errorMessage')}</span>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Calendar Booking */}
              <div className="bg-card rounded-2xl p-8 shadow-md border border-border">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {t('calendarTitle')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('calendarDescription')}
                    </p>
                    <Button
                      onClick={handleCalendarClick}
                      variant="outline"
                      className="border-cyan-500 text-cyan-500"
                    >
                      {t('bookMeeting')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Direct Email */}
              <div className="bg-card rounded-2xl p-8 shadow-md border border-border">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {t('emailTitle')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('emailDescription')}
                    </p>
                    <Button
                      onClick={handleEmailClick}
                      variant="outline"
                      className="border-cyan-500 text-cyan-500"
                    >
                      <SendHorizonal className="mr-2 h-4 w-4" />
                      {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'piotr.podgorski.software@gmail.com'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
