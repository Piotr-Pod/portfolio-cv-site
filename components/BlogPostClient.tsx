'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatDateISO } from '@/lib/utils'
import PersonalizedPost from '@/components/PersonalizedPost'
import StickyBlogHeader from '@/components/StickyBlogHeader'
import type { BlogPostDetail } from '@/lib/blog-model'
import type { Persona } from '@/types/p13n'
import TrackPostView from '@/components/TrackPostView'

interface BlogPostClientProps {
  data: BlogPostDetail
  locale: 'pl' | 'en'
}

export default function BlogPostClient({ data, locale }: BlogPostClientProps) {
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null)
  const t = useTranslations('blog')

  const handleChangeAudience = () => {
    // Trigger opening the P13n menu in PersonalizedPost
    window.dispatchEvent(new CustomEvent('openP13nMenu'))
  }

  return (
    <>
      <StickyBlogHeader 
        title={data.title}
        locale={locale}
        selectedPersona={selectedPersona}
        onChangeAudience={handleChangeAudience}
      />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <TrackPostView postId={data.slug} />
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-sm">
            <Link className="text-muted-foreground underline-offset-4 hover:underline transition-colors" href={`/${locale}/blog`}>
              {t('backToBlog')}
            </Link>
          </div>
          <div className="prose dark:prose-invert">
            <h1 className="mb-2">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={data.date}>{formatDateISO(data.date)}</time>
              <span>•</span>
              <span>{t('readingMinutes', { minutes: data.readingTimeMinutes })}</span>
              {data.tags && data.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">#{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            {data.description && <p className="mt-2 text-base text-foreground/80">{data.description}</p>}
            <div className="mt-8">
              <PersonalizedPost 
                postId={data.slug} 
                initialMarkdown={data.contentMarkdown}
                onPersonaChange={setSelectedPersona}
                onOpenP13nMenu={handleChangeAudience}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
