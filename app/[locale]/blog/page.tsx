import React from 'react'
import { getAllPosts } from '@/lib/blog'
import BlogList from '@/components/BlogList'
import { getTranslations } from 'next-intl/server'

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const posts = getAllPosts(locale)

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


