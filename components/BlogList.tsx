"use client"

import React from 'react'
import Link from 'next/link'
import { type BlogPostIndexItem } from '@/lib/blog'
import { formatDateISO } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface BlogListProps {
  posts: BlogPostIndexItem[]
  locale: 'pl' | 'en'
}

export default function BlogList({ posts, locale }: BlogListProps) {
  const t = useTranslations('blog')
  const allTags = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of posts) for (const t of p.tags) set.add(t)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [posts])

  const [selectedTags, setSelectedTags] = React.useState<Set<string>>(new Set())
  const [isCompact, setIsCompact] = React.useState(false)
  const [showAllTags, setShowAllTags] = React.useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const clearTags = () => setSelectedTags(new Set())

  const filtered = React.useMemo(() => {
    if (selectedTags.size === 0) return posts
    return posts.filter(p => p.tags.some(t => selectedTags.has(t)))
  }, [posts, selectedTags])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative -mx-2 max-w-full flex-1 overflow-x-auto px-2">
          <div className="flex items-center gap-2 pr-6">
          {allTags.length > 6 && (
            <Button variant="outline" size="sm" onClick={() => setShowAllTags(v => !v)}>
              {showAllTags ? t('less') : t('moreTags')}
            </Button>
          )}
          {(showAllTags ? allTags : allTags.slice(0, 6)).map(tag => {
            const active = selectedTags.has(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/70'
                }`}
                aria-pressed={active}
              >
                #{tag}
              </button>
            )
          })}
          </div>
          {allTags.length > 6 && (
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
          )}
        </div>
        <div className="ml-auto inline-flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isCompact ? t('view.compact') : t('view.card')}
          </span>
          <Button variant={isCompact ? 'secondary' : 'outline'} size="sm" onClick={() => setIsCompact(v => !v)}>
            {isCompact ? t('toggle.cards') : t('toggle.compact')}
          </Button>
        </div>
      </div>
        
        {selectedTags.size > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="rounded-full px-3 py-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {t('clearTags')}
            </button>
          )}

      {isCompact ? (
        <ul className="divide-y rounded-lg border bg-card">
          {filtered.map(post => (
            <li key={post.slug} className="grid grid-cols-[1fr_auto] items-center gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="min-w-0">
                <Link href={`/${locale}/blog/${post.slug}`} className="truncate font-medium underline-offset-4 hover:underline">
                  {post.title}
                </Link>
                {post.description && (
                  <p className="truncate text-sm text-muted-foreground">
                    {post.description}
                  </p>
                )}
              </div>
              <time className="col-start-2 text-xs text-muted-foreground sm:col-start-auto" dateTime={post.date}>
                {formatDateISO(post.date)}
              </time>
              <span className="hidden text-xs text-muted-foreground sm:block">{t('readingMinutes', { minutes: post.readingTimeMinutes })}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <time dateTime={post.date}>{formatDateISO(post.date)}</time>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]">
                  {t('readingMinutes', { minutes: post.readingTimeMinutes })}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                <Link className="inline-block underline-offset-4 group-hover:underline" href={`/${locale}/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              {post.description && (
                <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
              )}
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}


