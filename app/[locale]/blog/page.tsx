import React from 'react'
import BlogList from '@/components/BlogList'
import { getTranslations } from 'next-intl/server'
import type { BlogPostIndexItem } from '@/lib/blog-model'

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')
  // Ensure absolute URL to avoid ERR_INVALID_URL on server
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/blog?locale=${locale}`, { next: { revalidate: 60 } })
  const posts = (await res.json()) as BlogPostIndexItem[]

  return (
    <main className="container mx-auto px-4 pt-24 pb-16">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t('noPosts')}</p>
      ) : (
        <BlogList posts={posts} locale={locale} />
      )}
    </main>
  )
}


