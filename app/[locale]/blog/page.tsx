import React from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { formatDateISO } from '@/lib/utils'

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }) {
  const { locale } = await params
  const posts = getAllPosts(locale)

  return (
    <main className="container mx-auto px-4 pt-24 pb-16">
      <h1 className="text-3xl font-bold mb-6">{locale === 'pl' ? 'Blog' : 'Blog'}</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-border pb-6">
            <h2 className="text-xl font-semibold">
              <Link className="hover:underline" href={`/${locale}/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{formatDateISO(post.date)}</p>
            {post.description && <p className="mt-2">{post.description}</p>}
            {post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground">{locale === 'pl' ? 'Brak wpisów.' : 'No posts yet.'}</p>
        )}
      </div>
    </main>
  )
}


