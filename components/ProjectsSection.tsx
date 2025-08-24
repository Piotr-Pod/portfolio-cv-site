'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ProjectsSection() {
  const t = useTranslations('projects');

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

  const projects = [
    {
      title: 'E-commerce Microservices Platform',
      description: 'Skalowalna platforma e-commerce zbudowana z mikrousług w Spring Boot, z integracją Kafka dla przetwarzania zamówień w czasie rzeczywistym.',
      technologies: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker'],
      image: '/api/avatar', // Placeholder - would be replaced with actual project image
      githubUrl: '#',
      liveUrl: '#',
      featured: true,
    },
    {
      title: 'Real-time Analytics Dashboard',
      description: 'Dashboard do analizy danych w czasie rzeczywistym z wykorzystaniem Apache Kafka Streams i React dla frontendu.',
      technologies: ['Java', 'Kafka Streams', 'React', 'TypeScript', 'Redis'],
      image: '/api/avatar',
      githubUrl: '#',
      liveUrl: '#',
      featured: false,
    },
    {
      title: 'API Gateway & Authentication Service',
      description: 'Centralny punkt dostępu do API z autoryzacją JWT, rate limiting i monitoringiem z wykorzystaniem Spring Cloud Gateway.',
      technologies: ['Spring Cloud', 'JWT', 'Redis', 'Prometheus', 'Grafana'],
      image: '/api/avatar',
      githubUrl: '#',
      liveUrl: '#',
      featured: false,
    },
  ];

  return (
    <section id="projects" className="py-20 bg-slate-50">
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
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {t('description')}
            </p>
          </motion.div>

          {/* Featured Project */}
          <motion.div className="mb-16" variants={itemVariants}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {t('featured')}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    {projects[0].title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {projects[0].description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {projects[0].technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      {t('sourceCode')}
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('viewDemo')}
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-8">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-xl font-medium">E-commerce Platform</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other Projects Grid */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={itemVariants}
          >
            {projects.slice(1).map((project, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white text-2xl">📊</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {project.title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-500"
                  >
                    <Github className="mr-2 h-3 w-3" />
                    {t('code')}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {t('demo')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div 
            className="text-center mt-16"
            variants={itemVariants}
          >
            <Button
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
            >
              {t('viewMore')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
