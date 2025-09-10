import React from 'react'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { formatDateISO } from '@/lib/utils'

interface PageProps {
  params: Promise<{ locale: 'pl' | 'en'; slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params
  const { frontmatter, content } = getPostBySlug(slug)
  const postLocale = (frontmatter.locale as 'pl' | 'en') ?? 'pl'
  if (postLocale !== locale || frontmatter.draft) return notFound()

  return (
    <main className="container mx-auto px-4 pt-24 pb-16 prose dark:prose-invert max-w-3xl">
      <h1 className="mb-2">{frontmatter.title}</h1>
      <p className="text-sm text-muted-foreground">{formatDateISO(frontmatter.date)}</p>
      {frontmatter.description && <p className="mt-2">{frontmatter.description}</p>}
      <article className="mt-8">
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]],
            },
          }}
        />
      </article>
    </main>
  )
}

export async function generateStaticParams() {
  const slugs = getAllPosts('pl').concat(getAllPosts('en')).map((p) => ({ slug: p.slug }))
  return slugs
}

