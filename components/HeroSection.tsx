'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Mail, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const t = useTranslations('hero');
  const [showPopup, setShowPopup] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
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

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -20,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      }
    },
  };

  const handleDownloadCV = () => {
    // TODO: Implement CV download functionality
    console.log('Download CV clicked');
    
    // Show popup
    setShowPopup(true);
    
    // Hide popup after 2 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    console.log('Contact clicked');
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-background relative pt-16">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Avatar */}
          <motion.div
            className="mb-8 flex justify-center"
            variants={itemVariants}
          >
            <Avatar className="h-32 w-32 border-4 border-background rounded-2xl shadow-lg">
              <AvatarImage
                src="/api/avatar"
                alt="AI Generated Avatar"
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl">
                PP
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight"
            variants={itemVariants}
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle/Tagline */}
          <motion.p
            className="text-xl md:text-2xl text-cyan-500 font-medium mb-6"
            variants={itemVariants}
          >
            {t('subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            {t('description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <Button
              size="lg"
              onClick={handleDownloadCV}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <Download className="mr-2 h-5 w-5" />
              {t('downloadCv')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleContact}
              className="group px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              <Mail className="mr-2 h-5 w-5" />
              {t('contact')}
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-muted-foreground rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-md flex items-center space-x-3 border border-emerald-400">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">CV zostało pobrane!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
