import React from 'react'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { formatDateISO } from '@/lib/utils'
import { renderMarkdownToHtml } from '@/lib/markdown'

interface PageProps {
  params: Promise<{ locale: 'pl' | 'en'; slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params
  const { frontmatter, content } = getPostBySlug(slug)
  const postLocale = (frontmatter.locale as 'pl' | 'en') ?? 'pl'
  if (postLocale !== locale || frontmatter.draft) return notFound()
  const html = await renderMarkdownToHtml(content)

  return (
    <main className="container mx-auto px-4 pt-24 pb-16">
      <div className="prose dark:prose-invert prose-headings:scroll-mt-24 prose-img:rounded-lg max-w-3xl">
        <h1 className="mb-2">{frontmatter.title}</h1>
        <p className="text-sm text-muted-foreground">{formatDateISO(frontmatter.date)}</p>
        {frontmatter.description && <p className="mt-2">{frontmatter.description}</p>}
        <article className="mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  const slugs = getAllPosts('pl').concat(getAllPosts('en')).map((p) => ({ slug: p.slug }))
  return slugs
}

