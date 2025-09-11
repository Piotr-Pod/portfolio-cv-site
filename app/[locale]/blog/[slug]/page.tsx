import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/blog'
import { formatDateISO } from '@/lib/utils'
// Markdown is rendered client-side via PersonalizedPost component
import PersonalizedPost from '@/components/PersonalizedPost'
import { getTranslations } from 'next-intl/server'
import type { BlogPostDetail } from '@/lib/blog-model'
import TrackPostView from '@/components/TrackPostView'

interface PageProps {
  params: Promise<{ locale: 'pl' | 'en'; slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params
  // Ensure absolute URL to avoid ERR_INVALID_URL on server
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/blog/${slug}?locale=${locale}`, { cache: 'no-store' })
  if (!res.ok) return notFound()
  const data = (await res.json()) as BlogPostDetail
  if (data.draft || data.locale !== 'pl') return notFound()
  const t = await getTranslations('blog')

  return (
    <main className="container mx-auto px-4 pt-24 pb-20">
      <TrackPostView postId={data.slug} />
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-sm">
          <Link className="text-muted-foreground underline-offset-4 hover:underline" href={`/${locale}/blog`}>
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
            <PersonalizedPost postId={data.slug} initialMarkdown={data.contentMarkdown} />
          </div>
        </div>
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  const slugs = getAllPosts('pl').map((p) => ({ slug: p.slug }))
  return slugs
}

