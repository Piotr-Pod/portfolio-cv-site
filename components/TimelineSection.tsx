'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Code, 
  Calendar,
  MapPin,
  Building,
  ChevronDown,
  ChevronUp,
  Expand,
  Minimize,
  Rocket,
  Zap,
  Star,
  Shield,
  type LucideIcon,
  Handshake,
  Github
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type TimelineType = 'work' | 'education' | 'training' | 'projects';

interface TimelineItem {
  id: string;
  type: 'work' | 'education' | 'training' | 'projects';
  title: string;
  subtitle: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies?: string[];
  achievements?: string[];
  category: {
    label: string;
    color: string;
  };
  customIcon?: LucideIcon; // Optional custom Lucide icon override
  iconColor?: string; // Optional custom color override
  iconImage?: string; // Optional custom image path (takes precedence over customIcon)
}

export function TimelineSection() {
  const t = useTranslations('timeline');
  const [enabledFilters, setEnabledFilters] = useState<Set<TimelineType>>(
    new Set<TimelineType>(['work', 'education', 'training', 'projects'])
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set<string>());
  const [showStickyControls, setShowStickyControls] = useState<boolean>(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  const nonExpandableIds = new Set<string>(['projects-2']);

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

  const getCategoryInfo = (type: TimelineType) => {
    switch (type) {
      case 'work':
        return {
          label: t('filters.work'),
          color: 'bg-blue-600 text-white'
        };
      case 'education':
        return {
          label: t('filters.education'),
          color: 'bg-amber-200 text-amber-900'
        };
      case 'training':
        return {
          label: t('filters.training'),
          color: 'bg-green-600 text-white'
        };
      case 'projects':
        return {
          label: t('filters.projects'),
          color: 'bg-orange-500 text-white'
        };
      default:
        return {
          label: t('filters.work'),
          color: 'bg-gray-500 text-white'
        };
    }
  };

  // Timeline data structure with translation keys
  const timelineDataStructure: Array<{
    id: string;
    type: TimelineType;
    startDate: string;
    endDate: string | null;
    customIcon?: LucideIcon;
    iconColor?: string;
    iconImage?: string;
  }> = [
    // Work (6)
    {
      id: 'work-1',
      type: 'work',
      startDate: '2025-05',
      endDate: null,
      customIcon: Handshake,
      iconColor: 'bg-gradient-to-br from-blue-600 to-indigo-700'
    },
    {
      id: 'work-2',
      type: 'work',
      startDate: '2022-05',
      endDate: '2025-05',
      customIcon: Shield,
      iconImage: '/images/pkobp_128.png',
      iconColor: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    {
      id: 'work-3',
      type: 'work',
      startDate: '2019-09',
      endDate: '2022-05',
      customIcon: Shield,
      iconImage: '/images/orange.png',
      iconColor: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      id: 'work-4',
      type: 'work',
      startDate: '2018-07',
      endDate: '2019-08',
      customIcon: Building,
      iconColor: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      id: 'work-5',
      type: 'work',
      startDate: '2017-08',
      endDate: '2018-04',
      customIcon: Rocket,
      iconColor: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      id: 'work-6',
      type: 'work',
      startDate: '2016-07',
      endDate: '2017-03',
      customIcon: Code,
      iconImage: '/images/comarch.png',
      iconColor: 'bg-gradient-to-br from-gray-500 to-slate-600'
    },
    // Education (2)
    {
      id: 'education-1',
      type: 'education',
      startDate: '2014-10',
      endDate: '2019-06',
      customIcon: GraduationCap,
      iconImage: '/images/weeia-logo.png',
      iconColor: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      id: 'education-2',
      type: 'education',
      startDate: '2018-02',
      endDate: '2018-09',
      customIcon: GraduationCap,
      iconImage: '/images/agh.png',
      iconColor: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    // Training (4)
    {
      id: 'training-1',
      type: 'training',
      startDate: '2024-11',
      endDate: '2025-01',
      customIcon: Zap,
      iconImage: '/images/ai-devs-3-logo.png',
      iconColor: 'bg-gradient-to-br from-blue-400 to-cyan-500'
    },
    {
      id: 'training-2',
      type: 'training',
      startDate: '2025-02',
      endDate: '2025-03',
      customIcon: Star,
      iconImage: '/images/um_jutra_ai.png',
      iconColor: 'bg-gradient-to-br from-emerald-400 to-teal-500'
    },
    {
      id: 'training-3',
      type: 'training',
      startDate: '2017-02',
      endDate: '2018-02',
      customIcon: BookOpen,
      iconColor: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      id: 'training-4',
      type: 'training',
      startDate: '2017-04',
      endDate: '2018-02',
      customIcon: BookOpen,
      iconColor: 'bg-gradient-to-br from-indigo-500 to-blue-600'
    },
    // Projects (1)
    {
      id: 'projects-1',
      type: 'projects',
      startDate: '2025-08',
      endDate: null,
      customIcon: Code,
      iconColor: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    // Projects - GitHub CTA (oldest to appear at the bottom)
    {
      id: 'projects-2',
      type: 'projects',
      startDate: '2000-01',
      endDate: null,
      customIcon: Github,
      iconColor: 'bg-neutral-900 text-white'
    }
  ];

  // Build timeline data with translations
  const timelineData: TimelineItem[] = timelineDataStructure.map(item => {
    const itemTranslations = t.raw(`items.${item.id}`);
    return {
      ...item,
      title: itemTranslations.title,
      subtitle: itemTranslations.subtitle,
      location: itemTranslations.location,
      description: itemTranslations.description,
      technologies: itemTranslations.technologies,
      achievements: itemTranslations.achievements,
      category: getCategoryInfo(item.type),
    };
  });

  const filteredItems = timelineData.filter(item => enabledFilters.has(item.type));

  // Sortowanie po startDate (najnowsze pierwsze)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = a.startDate;
    const dateB = b.startDate;
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
        return 'bg-amber-200 text-amber-900';
      case 'training':
        return 'bg-green-600 text-white';
      case 'projects':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500';
    }
  };

  const getItemIcon = (item: TimelineItem) => {
    return item.customIcon || getTypeIcon(item.type);
  };

  const getItemColor = (item: TimelineItem) => {
    return item.iconColor || getTypeColor(item.type);
  };

  const hasCustomImage = (item: TimelineItem) => {
    return Boolean(item.iconImage);
  };

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthKeys = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    const monthName = t(`months.${monthKeys[parseInt(month) - 1]}`);
    return `${monthName} ${year}`;
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

  const toggleItemExpanded = (itemId: string) => {
    if (nonExpandableIds.has(itemId)) return;
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  };

  const toggleAllExpanded = () => {
    const visibleItemIds = filteredItems.filter(item => !nonExpandableIds.has(item.id)).map(item => item.id);
    const allVisible = visibleItemIds.length > 0 && visibleItemIds.every(id => expandedItems.has(id));
    
    if (allVisible) {
      // Jeśli wszystkie widoczne są rozwinięte, zwiń wszystkie
      setExpandedItems(new Set());
    } else {
      // Jeśli nie wszystkie są rozwinięte, rozwiń wszystkie widoczne
      setExpandedItems(new Set(visibleItemIds));
    }
  };

  const allVisibleExpanded = (() => {
    const expandable = filteredItems.filter(item => !nonExpandableIds.has(item.id));
    return expandable.length > 0 && expandable.every(item => expandedItems.has(item.id));
  })();

  const filterOptions = [
    { key: 'all' as const, label: t('filters.all'), icon: null, onClick: toggleAllFilters, isActive: enabledFilters.size === 4 },
    { key: 'work' as TimelineType, label: t('filters.work'), icon: Briefcase, onClick: () => toggleFilter('work'), isActive: enabledFilters.has('work') },
    { key: 'education' as TimelineType, label: t('filters.education'), icon: GraduationCap, onClick: () => toggleFilter('education'), isActive: enabledFilters.has('education') },
    { key: 'training' as TimelineType, label: t('filters.training'), icon: BookOpen, onClick: () => toggleFilter('training'), isActive: enabledFilters.has('training') },
    { key: 'projects' as TimelineType, label: t('filters.projects'), icon: Code, onClick: () => toggleFilter('projects'), isActive: enabledFilters.has('projects') },
  ];

  // Detect when filter controls scroll under the navigation bar and show sticky controls
  useEffect(() => {
    const handleScroll = () => {
      const navOffsetPx = 64; // matches top-16 used in StickyBlogHeader
      const threshold = navOffsetPx + 8; // small gap for sticky reveal

      const filtersRect = filtersRef.current?.getBoundingClientRect();
      const sectionRect = sectionRef.current?.getBoundingClientRect();

      const filtersScrolledUnderNav = filtersRect ? filtersRect.top < threshold : false;

      // Consider the timeline "visible context" when any part of it is near the viewport
      // so sticky is hidden deep below the next section
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const sectionInView = sectionRect
        ? (sectionRect.bottom > threshold && sectionRect.top < viewportHeight - 80)
        : false;

      const shouldShow = filtersScrolledUnderNav && sectionInView;
      setShowStickyControls(shouldShow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="timeline" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t('description')}
            </p>
          </motion.div>

          {/* Sticky Controls (shown when original controls are scrolled under navbar) */}
          <div
            className={`fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm transition-all duration-300 ease-in-out
            ${showStickyControls ? 'top-16 translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
            style={{ position: 'fixed' }}
            aria-hidden={!showStickyControls}
          >
            <div className="container mx-auto px-4 py-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Filters row */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
                  {filterOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Button
                        key={`sticky-${String(option.key)}`}
                        variant={option.isActive ? "default" : "outline"}
                        onClick={option.onClick}
                        size="sm"
                        className={`transition-all duration-300 text-[11px] md:text-sm h-7 md:h-9 px-2 md:px-3
                          ${option.isActive 
                            ? 'bg-primary text-primary-foreground shadow' 
                            : 'border-border text-muted-foreground hover:border-slate-900 hover:text-foreground'
                          }
                        `}
                        aria-pressed={option.isActive}
                      >
                        {IconComponent && <IconComponent className="mr-1 h-3.5 w-3.5 hidden xs:inline-block md:inline-block" />}
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
                {/* Expand/collapse control */}
                {filteredItems.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={toggleAllExpanded}
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 whitespace-nowrap h-7 md:h-9"
                    aria-expanded={allVisibleExpanded}
                  >
                    {allVisibleExpanded ? (
                      <>
                        <Minimize className="mr-2 h-4 w-4" />
                        {t('collapseAll')}
                      </>
                    ) : (
                      <>
                        <Expand className="mr-2 h-4 w-4" />
                        {t('expandAll')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <motion.div 
            ref={filtersRef}
            className="flex flex-wrap justify-center gap-2 mb-6"
            variants={itemVariants}
          >
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.key}
                  variant={option.isActive ? "default" : "outline"}
                  onClick={option.onClick}
                  size="sm"
                  className={`
                    transition-all duration-300 hover:scale-105 text-sm
                    ${option.isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'border-border text-muted-foreground hover:border-slate-900 hover:text-foreground'
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="mr-1.5 h-3.5 w-3.5" />}
                  {option.label}
                </Button>
              );
            })}
          </motion.div>

          {/* Expand All Button */}
          <AnimatePresence>
            {filteredItems.length > 0 && (
              <motion.div 
                key="expand-all-button"
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  onClick={toggleAllExpanded}
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
                >
                  {allVisibleExpanded ? (
                    <>
                      <Minimize className="mr-2 h-4 w-4" />
                      {t('collapseAll')}
                    </>
                  ) : (
                    <>
                      <Expand className="mr-2 h-4 w-4" />
                      {t('expandAll')}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border"></div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={Array.from(enabledFilters).sort().join(',')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {sortedItems.map((item, index) => {
                  const IconComponent = getItemIcon(item);
                  const colorClass = getItemColor(item);
                  const isExpanded = expandedItems.has(item.id);
                  
                  return (
                    <motion.div
                      key={item.id}
                      className="relative pl-16"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Timeline Icon */}
                      <div className={`absolute left-3 top-6 w-8 h-8 ${hasCustomImage(item) ? 'bg-transparent' : colorClass} rounded-full flex items-center justify-center shadow-md z-10 overflow-hidden`}>
                        {hasCustomImage(item) ? (
                          <Image
                            src={item.iconImage!}
                            alt={`${item.title} icon`}
                            width={32}
                            height={32}
                            className="rounded-full object-cover w-full h-full"
                            unoptimized // For better compatibility with various image formats
                          />
                        ) : (
                          <IconComponent className="h-4 w-4 text-white" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-border">
                        {/* Header - always visible */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {item.id === 'projects-2' && githubUrl ? (
                                <a
                                  href={githubUrl}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="text-lg font-bold text-blue-600 hover:underline"
                                >
                                  {t('items.projects-2.title')}
                                </a>
                              ) : (
                                <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                                  {item.title}
                                </h3>
                              )}
                              {item.category && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.category.color}`}>
                                  {item.category.label}
                                </span>
                              )}
                            </div>
                            {item.id !== 'projects-2' && (
                              <div className="flex items-center text-muted-foreground mt-1 mb-1">
                                <Building className="h-3.5 w-3.5 mr-1.5" />
                                <span className="font-medium text-sm">{item.subtitle}</span>
                              </div>
                            )}
                            {item.id !== 'projects-2' && !isExpanded && (
                              <div className="flex items-center text-muted-foreground text-xs">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                <span>
                                  {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : t('currently')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Toggle button (hidden for non-expandable GitHub item) */}
                          {item.id !== 'projects-2' && (
                            <button
                              onClick={() => toggleItemExpanded(item.id)}
                              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors mt-2 md:mt-0"
                            >
                              <span>{isExpanded ? t('showLess') : t('showMore')}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Basic description - always visible */}
                        <p className="text-muted-foreground leading-relaxed mb-3 text-sm">
                          {item.id === 'projects-2' ? t('moreProjects') : item.description}
                        </p>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && item.id !== 'projects-2' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              {/* Extended info */}
                              <div className="mb-4 p-3 bg-muted rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="flex items-center text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                                    <span><strong>{t('location')}:</strong> {item.location}</span>
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                                    <span><strong>{t('period')}:</strong> {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : t('currently')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Technologies and Achievements - full view */}
                              <div className="flex flex-col lg:flex-row lg:gap-6">
                                {/* Technologies */}
                                {item.technologies && item.technologies.length > 0 && (
                                  <div className="mb-4 lg:mb-0 lg:w-[40%]">
                                    <h4 className="text-xs font-semibold text-foreground mb-2">
                                      {t('technologies')}:
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.technologies.map((tech, techIndex) => (
                                        <span
                                          key={techIndex}
                                          className="bg-muted text-foreground px-2 py-0.5 rounded-full text-xs font-medium"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Achievements - full list */}
                                {item.achievements && item.achievements.length > 0 && (
                                  <div className="lg:w-[60%]">
                                    <h4 className="text-xs font-semibold text-foreground mb-2">
                                      {t('achievements')}:
                                    </h4>
                                    <ul className="space-y-1">
                                      {item.achievements.map((achievement, achievementIndex) => (
                                        <li
                                          key={achievementIndex}
                                          className="text-xs text-muted-foreground flex items-start"
                                        >
                                          <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                          {achievement}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Collapsed preview - only when not expanded */}
                        {!isExpanded && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {item.technologies && item.technologies.length > 0 && (
                              <span>🔧 {item.technologies.length} {t('technologiesCount')}</span>
                            )}
                            {item.achievements && item.achievements.length > 0 && (
                              <span>🏆 {item.achievements.length} {t('achievementsCount')}</span>
                            )}
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
