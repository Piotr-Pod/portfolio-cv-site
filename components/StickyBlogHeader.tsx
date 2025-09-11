'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Persona } from '@/types/p13n'

interface StickyBlogHeaderProps {
  title: string
  locale: 'pl' | 'en'
  selectedPersona?: Persona | null
  onChangeAudience?: () => void
  className?: string
}

export function StickyBlogHeader({ 
  title, 
  locale, 
  selectedPersona, 
  onChangeAudience,
  className 
}: StickyBlogHeaderProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const t = useTranslations('blog')
  const tP13n = useTranslations('p13n')
  
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const shouldShow = scrollY > 200
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Sticky header scroll:', { scrollY, shouldShow, currentVisible: isVisible })
      }
      
      setIsVisible(shouldShow)
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isVisible])

  const getPersonaLabel = (persona: Persona) => {
    const personas = {
      'HR': tP13n('personas.HR'),
      'NonIT': tP13n('personas.NonIT'),
      'Child10': tP13n('personas.Child10'),
      'Poet': tP13n('personas.Poet'),
      'Developer': tP13n('personas.Developer'),
      'Custom': tP13n('personas.Custom')
    }
    return personas[persona] || persona
  }

  const handleChangeClick = () => {
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Then trigger the audience change
    setTimeout(() => {
      onChangeAudience?.()
    }, 300)
  }

  return (
    <div 
      className={cn(
        "fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        "transition-all duration-300 ease-in-out",
        className
      )}
      style={{ position: 'fixed' }} // Force fixed positioning
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link 
              href={`/${locale}/blog`}
              className="text-muted-foreground underline-offset-4 hover:underline text-sm whitespace-nowrap transition-colors"
            >
              {t('backToBlog')}
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-medium truncate text-foreground">
                {title}
              </h1>
              {selectedPersona && (
                <p className="text-xs text-muted-foreground">
                  {tP13n('buttons.readingAs', { persona: getPersonaLabel(selectedPersona) })}
                </p>
              )}
            </div>
          </div>
          {onChangeAudience && (
            <button
              onClick={handleChangeClick}
              className="text-muted-foreground underline-offset-4 hover:underline text-sm whitespace-nowrap transition-colors"
              aria-label={tP13n('stickyHeader.changeAudienceAriaLabel')}
            >
              {tP13n('stickyHeader.change')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StickyBlogHeader
