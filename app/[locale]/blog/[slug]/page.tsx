import React from 'react'
import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/blog'
import BlogPostClient from '@/components/BlogPostClient'
import type { BlogPostDetail } from '@/lib/blog-model'

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

  return <BlogPostClient data={data} locale={locale} />
}

export async function generateStaticParams() {
  const slugs = getAllPosts('pl').map((p) => ({ slug: p.slug }))
  return slugs
}

