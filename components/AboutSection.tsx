'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Code, Database, Cloud, Zap } from 'lucide-react';

export function AboutSection() {
  const t = useTranslations('about');

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

  const skills = [
    {
      icon: Code,
      title: 'Java & Spring',
      description: 'Doświadczenie w tworzeniu aplikacji enterprise z wykorzystaniem Spring Boot, Spring Security i Spring Data.',
      color: 'bg-blue-500',
    },
    {
      icon: Database,
      title: 'Mikrousługi',
      description: 'Architektura rozproszona, komunikacja między usługami, wzorce projektowe i najlepsze praktyki.',
      color: 'bg-cyan-500',
    },
    {
      icon: Cloud,
      title: 'Cloud & DevOps',
      description: 'Wdrażanie w chmurze, konteneryzacja z Docker, orkiestracja z Kubernetes, CI/CD pipelines.',
      color: 'bg-emerald-500',
    },
    {
      icon: Zap,
      title: 'Przetwarzanie danych',
      description: 'Apache Kafka, stream processing, event-driven architecture, real-time data processing.',
      color: 'bg-purple-500',
    },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-6xl mx-auto"
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
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('description')}
            </p>
          </motion.div>

          {/* Skills Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={itemVariants}
          >
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group border border-border"
                whileHover={{ y: -5 }}
              >
                <div className={`w-12 h-12 ${skill.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <skill.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {skill.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {skill.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Experience Summary */}
          <motion.div 
            className="mt-16 bg-muted rounded-2xl p-8 border border-border"
            variants={itemVariants}
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
                <div className="text-muted-foreground">{t('experience')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-600 mb-2">20+</div>
                <div className="text-muted-foreground">{t('projects')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">15+</div>
                <div className="text-muted-foreground">{t('technologies')}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
