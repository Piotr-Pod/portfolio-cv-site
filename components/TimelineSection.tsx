'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Code, 
  Calendar,
  MapPin,
  Building
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type TimelineType = 'work' | 'education' | 'training' | 'projects';

interface TimelineItem {
  id: string;
  type: 'work' | 'education' | 'training' | 'projects';
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies?: string[];
  achievements?: string[];
}

export function TimelineSection() {
  const t = useTranslations('timeline');
  const [enabledFilters, setEnabledFilters] = useState<Set<TimelineType>>(
    new Set(['work', 'education', 'training', 'projects'])
  );

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

  const timelineData: TimelineItem[] = [
    // Prace (3)
    {
      id: 'work-1',
      type: 'work',
      title: 'Senior Backend Developer',
      company: 'TechCorp Solutions',
      location: 'Warszawa, Polska',
      startDate: '2022-03',
      endDate: null,
      description: 'Prowadzenie zespołu developerów w tworzeniu skalowalnej architektury mikrousług. Odpowiedzialność za design i implementację systemów przetwarzających miliony transakcji dziennie.',
      technologies: ['Java', 'Spring Boot', 'Apache Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
      achievements: [
        'Zwiększenie wydajności systemu o 40%',
        'Redukcja czasu wdrażania z 2h do 15min',
        'Mentoring 3 junior developerów'
      ]
    },
    {
      id: 'work-2',
      type: 'work',
      title: 'Backend Developer',
      company: 'FinanceApp Sp. z o.o.',
      location: 'Kraków, Polska',
      startDate: '2020-06',
      endDate: '2022-02',
      description: 'Rozwój systemu płatności online z integracją zewnętrznych dostawców. Implementacja algorytmów wykrywania fraudu i systemów raportowania w czasie rzeczywistym.',
      technologies: ['Java', 'Spring Framework', 'Redis', 'MySQL', 'RabbitMQ'],
      achievements: [
        'Implementacja systemu anti-fraud',
        'Integracja z 5 dostawcami płatności',
        'Optymalizacja bazy danych - 60% szybsze zapytania'
      ]
    },
    {
      id: 'work-3',
      type: 'work',
      title: 'Java Developer',
      company: 'StartupLab',
      location: 'Gdańsk, Polska',
      startDate: '2019-01',
      endDate: '2020-05',
      description: 'Tworzenie MVP dla startupów technologicznych. Praca w środowisku agile z szybkim prototypowaniem i iteracyjnym rozwojem produktu.',
      technologies: ['Java', 'Spring Boot', 'MongoDB', 'AWS'],
      achievements: [
        'Dostarczenie 3 MVP w terminie',
        'Implementacja CI/CD pipeline',
        'Redukcja kosztów infrastruktury o 30%'
      ]
    },
    // Edukacja (1)
    {
      id: 'education-1',
      type: 'education',
      title: 'Magister Informatyki',
      company: 'Politechnika Warszawska',
      location: 'Warszawa, Polska',
      startDate: '2017-10',
      endDate: '2019-06',
      description: 'Specjalizacja: Inżynieria Oprogramowania. Praca magisterska na temat "Optymalizacja wydajności aplikacji Java w środowisku chmurowym".',
      achievements: [
        'Średnia ocen: 4.8/5.0',
        'Wyróżnienie za pracę magisterską',
        'Staż w laboratorium badawczym'
      ]
    },
    // Szkolenia (2)
    {
      id: 'training-1',
      type: 'training',
      title: 'AWS Solutions Architect',
      company: 'Amazon Web Services',
      location: 'Online',
      startDate: '2023-01',
      endDate: '2023-03',
      description: 'Intensywne szkolenie z architektury chmurowej AWS. Nauka best practices w projektowaniu skalowalnych i bezpiecznych systemów w chmurze.',
      achievements: [
        'Certyfikat AWS Solutions Architect - Associate',
        'Hands-on projekty z EC2, RDS, Lambda',
        'Design patterns dla architektury serverless'
      ]
    },
    {
      id: 'training-2',
      type: 'training',
      title: 'Apache Kafka Fundamentals',
      company: 'Confluent',
      location: 'Online',
      startDate: '2021-09',
      endDate: '2021-11',
      description: 'Pogłębione szkolenie z Apache Kafka i stream processing. Nauka wzorców projektowych dla event-driven architecture.',
      achievements: [
        'Certyfikat Confluent Kafka Developer',
        'Implementacja real-time data pipeline',
        'Optymalizacja performance Kafka clusters'
      ]
    },
    // Projekty własne (2)
    {
      id: 'project-1',
      type: 'projects',
      title: 'DevOps Automation Suite',
      company: 'Projekt osobisty',
      location: 'Praca zdalna',
      startDate: '2023-06',
      endDate: null,
      description: 'Open-source narzędzie do automatyzacji procesów DevOps. Integracja z popularnymi CI/CD platformami i monitoringiem infrastruktury.',
      technologies: ['Java', 'Spring Boot', 'Docker', 'Terraform', 'Prometheus'],
      achievements: [
        '500+ GitHub stars',
        'Użytkowane przez 10+ firm',
        'Prezentacja na konferencji DevOps Warsaw'
      ]
    },
    {
      id: 'project-2',
      type: 'projects',
      title: 'Crypto Trading Bot',
      company: 'Projekt osobisty',
      location: 'Praca zdalna',
      startDate: '2022-08',
      endDate: '2023-01',
      description: 'Algorytmiczny bot do handlu kryptowalutami z machine learning do predykcji trendów. Real-time analiza rynku i automatyczne wykonywanie transakcji.',
      technologies: ['Java', 'Spring WebFlux', 'Apache Kafka', 'TensorFlow Java', 'InfluxDB'],
      achievements: [
        '15% ROI w okresie testowym',
        'Przetwarzanie 1M+ zdarzeń/dzień',
        'Integration z 3 giełdami krypto'
      ]
    }
  ];

  const filteredItems = timelineData.filter(item => enabledFilters.has(item.type));

  // Sortowanie po dacie (najnowsze pierwsze)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = a.endDate || '9999-12'; // Aktualne pozycje na górze
    const dateB = b.endDate || '9999-12';
    return dateB.localeCompare(dateA);
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return Briefcase;
      case 'education':
        return GraduationCap;
      case 'training':
        return BookOpen;
      case 'projects':
        return Code;
      default:
        return Briefcase;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'bg-blue-500';
      case 'education':
        return 'bg-green-500';
      case 'training':
        return 'bg-purple-500';
      case 'projects':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthNames = [
      'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
      'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const toggleFilter = (filterType: TimelineType) => {
    setEnabledFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterType)) {
        newFilters.delete(filterType);
      } else {
        newFilters.add(filterType);
      }
      return newFilters;
    });
  };

  const toggleAllFilters = () => {
    const allTypes: TimelineType[] = ['work', 'education', 'training', 'projects'];
    if (enabledFilters.size === allTypes.length) {
      // Jeśli wszystkie są włączone, wyłącz wszystkie
      setEnabledFilters(new Set());
    } else {
      // Jeśli nie wszystkie są włączone, włącz wszystkie
      setEnabledFilters(new Set(allTypes));
    }
  };

  const filterOptions = [
    { key: 'all' as const, label: t('filters.all'), icon: null, onClick: toggleAllFilters, isActive: enabledFilters.size === 4 },
    { key: 'work' as TimelineType, label: t('filters.work'), icon: Briefcase, onClick: () => toggleFilter('work'), isActive: enabledFilters.has('work') },
    { key: 'education' as TimelineType, label: t('filters.education'), icon: GraduationCap, onClick: () => toggleFilter('education'), isActive: enabledFilters.has('education') },
    { key: 'training' as TimelineType, label: t('filters.training'), icon: BookOpen, onClick: () => toggleFilter('training'), isActive: enabledFilters.has('training') },
    { key: 'projects' as TimelineType, label: t('filters.projects'), icon: Code, onClick: () => toggleFilter('projects'), isActive: enabledFilters.has('projects') },
  ];

  return (
    <section id="timeline" className="py-20 bg-gradient-to-b from-white to-slate-50">
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
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {t('description')}
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            variants={itemVariants}
          >
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.key}
                  variant={option.isActive ? "default" : "outline"}
                  onClick={option.onClick}
                  className={`
                    transition-all duration-300 hover:scale-105
                    ${option.isActive 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                  {option.label}
                </Button>
              );
            })}
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={Array.from(enabledFilters).sort().join(',')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {sortedItems.map((item, index) => {
                  const IconComponent = getTypeIcon(item.type);
                  const colorClass = getTypeColor(item.type);
                  
                  return (
                    <motion.div
                      key={item.id}
                      className="relative pl-20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Timeline Icon */}
                      <div className={`absolute left-4 w-8 h-8 ${colorClass} rounded-full flex items-center justify-center shadow-lg z-10`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>

                      {/* Content Card */}
                      <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 group">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            <div className="flex items-center text-slate-600 mt-1 mb-2">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{item.company}</span>
                            </div>
                            <div className="flex items-center text-slate-500 text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-slate-500 text-sm mt-2 md:mt-0">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Obecnie'}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-4">
                          {item.description}
                        </p>

                        {/* Technologies */}
                        {item.technologies && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {item.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Achievements */}
                        {item.achievements && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                              {t('achievements')}:
                            </h4>
                            <ul className="space-y-1">
                              {item.achievements.map((achievement, achievementIndex) => (
                                <li
                                  key={achievementIndex}
                                  className="text-sm text-slate-600 flex items-start"
                                >
                                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
