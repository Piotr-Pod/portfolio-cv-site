import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { formatDateISO } from '@/lib/utils'
import { renderMarkdownToHtml } from '@/lib/markdown'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: 'pl' | 'en'; slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params
  const { frontmatter, content } = getPostBySlug(slug)
  const postLocale = (frontmatter.locale as 'pl' | 'en') ?? 'pl'
  if (postLocale !== locale || frontmatter.draft) return notFound()
  const html = await renderMarkdownToHtml(content)
  const t = await getTranslations('blog')

  return (
    <main className="container mx-auto px-4 pt-24 pb-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-sm">
          <Link className="text-muted-foreground underline-offset-4 hover:underline" href={`/${locale}/blog`}>
            {t('backToBlog')}
          </Link>
        </div>
        <div className="prose dark:prose-invert">
          <h1 className="mb-2">{frontmatter.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={frontmatter.date}>{formatDateISO(frontmatter.date)}</time>
            <span>•</span>
            <span>{t('readingMinutes', { minutes: Math.max(1, Math.round(content.split(/\s+/).length / 220)) })}</span>
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">#{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
          {frontmatter.description && <p className="mt-2 text-base text-foreground/80">{frontmatter.description}</p>}
          <article className="mt-8" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  const slugs = getAllPosts('pl').concat(getAllPosts('en')).map((p) => ({ slug: p.slug }))
  return slugs
}

