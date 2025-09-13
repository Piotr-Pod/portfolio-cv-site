'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Mail, CheckCircle, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-provider';
import { CvDownloadModal } from '@/components/CvDownloadModal';

export function HeroSection() {
  const t = useTranslations('hero');
  const { theme } = useTheme();
  const [showPopup, setShowPopup] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [avatarAchievement, setAvatarAchievement] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [isAvatarFlipped, setIsAvatarFlipped] = useState(false);

  // Check localStorage for avatar achievement on component mount
  useEffect(() => {
    const savedAchievement = localStorage.getItem('avatar-achievement');
    if (savedAchievement === 'true') {
      setAvatarAchievement(true);
      setIsAvatarFlipped(true);
    }
  }, []);

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
    setShowCvModal(true);
  };

  const handleContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleAvatarClick = () => {
    if (!avatarAchievement && theme === 'dark') {
      // Flip the avatar
      setIsAvatarFlipped(true);
      setAvatarAchievement(true);
      
      // Save to localStorage
      localStorage.setItem('avatar-achievement', 'true');
      
      // Show achievement popup
      setShowAchievementPopup(true);
      
      // Hide achievement popup after 3 seconds
      setTimeout(() => {
        setShowAchievementPopup(false);
      }, 3000);
    }
  };

  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-background relative pt-16">
      <div className="container mx-auto px-4 py-4">
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
            <motion.div
              className="relative"
              whileHover={!avatarAchievement && theme === 'dark' ? { scale: 1.05 } : {}}
              transition={{ duration: 0.2 }}
              style={{ cursor: !avatarAchievement && theme === 'dark' ? 'pointer' : 'default' }}
              onClick={handleAvatarClick}
            >
              {/* Glowing effect for dark mode avatar before achievement */}
              {!avatarAchievement && theme === 'dark' && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 40px rgba(59, 130, 246, 0.6)',
                      '0 0 20px rgba(59, 130, 246, 0.3)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
              
              <motion.div
                className="relative"
                animate={isAvatarFlipped ? { rotateY: 360 } : { rotateY: 0 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Avatar className="h-64 w-64 border-4 border-background rounded-2xl shadow-lg">
                  <AvatarImage
                    src={
                      avatarAchievement 
                        ? (theme === 'dark' ? "/images/avatar-dark.png" : "/images/avatar-light.png")
                        : "/images/avatar-light.png"
                    }
                    alt="AI Generated Avatar"
                    className="object-cover"
                  />
                </Avatar>
              </motion.div>
            </motion.div>
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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
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

            {githubUrl && (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="group px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                <a href={githubUrl} target="_blank" rel="noreferrer noopener">
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </a>
              </Button>
            )}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
                         <div className="flex flex-col items-center space-y-1">
               {/* Scroll text */}
               <motion.p
                 className="text-xs text-muted-foreground font-medium tracking-wider uppercase"
                 animate={{ 
                   opacity: [0.5, 1, 0.5]
                 }}
                 transition={{ 
                   duration: 2, 
                   repeat: Infinity, 
                   ease: 'easeInOut' 
                 }}
               >
                 {t('scroll')}
               </motion.p>
               
               {/* Down arrow */}
               <motion.div
                 className="w-4 h-4 text-muted-foreground"
                 animate={{ 
                   y: [0, 4, 0],
                   opacity: [0.6, 1, 0.6]
                 }}
                 transition={{ 
                   duration: 1.5, 
                   repeat: Infinity, 
                   ease: 'easeInOut',
                   delay: 0.5
                 }}
               >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.div>
             </div>
          </motion.div>
        </motion.div>
      </div>

      {/* CV Download Popup */}
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

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievementPopup && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 rounded-2xl shadow-lg flex items-center space-x-3 border border-purple-400">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🎉
              </motion.div>
              <span className="font-bold text-lg">Odkryto achievement! :)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CV Download Modal */}
      <CvDownloadModal
        isOpen={showCvModal}
        onClose={() => setShowCvModal(false)}
        locale={typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'pl' : 'pl'}
      />
    </section>
  );
}
