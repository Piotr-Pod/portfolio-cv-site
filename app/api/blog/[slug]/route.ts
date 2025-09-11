import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPostBySlug } from '@/lib/blog'
import type { BlogPostDetail, SupportedLocale } from '@/lib/blog-model'

const ParamsSchema = z.object({ slug: z.string().min(1) })
const QuerySchema = z.object({ locale: z.union([z.literal('pl'), z.literal('en')]).default('pl') })

async function fetchFromSupabase(slug: string, _locale: SupportedLocale): Promise<BlogPostDetail | null> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  try {
    // Assuming a view that returns one row by slug with contentMarkdown
    const url = `${supabaseUrl}/rest/v1/blog_posts_detail?slug=eq.${encodeURIComponent(slug)}&select=slug,locale,title,description,date,tags,coverImageUrl,authorName,authorAvatar,readingTimeMinutes,contentMarkdown,draft&limit=1`
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      cache: 'no-store'
    })
    if (!res.ok) return null
    const rows: any[] = await res.json()
    const r = rows[0]
    if (!r) return null
    const detail: BlogPostDetail = {
      slug: r.slug,
      locale: (r.locale as SupportedLocale) ?? 'pl',
      title: r.title,
      description: r.description ?? '',
      date: r.date,
      tags: Array.isArray(r.tags) ? r.tags : [],
      coverImageUrl: r.coverImageUrl ?? undefined,
      author: r.authorName ? { name: r.authorName as string, avatarUrl: r.authorAvatar ?? undefined } : undefined,
      readingTimeMinutes: typeof r.readingTimeMinutes === 'number' ? r.readingTimeMinutes : 1,
      contentMarkdown: r.contentMarkdown ?? '',
      draft: !!r.draft
    }
    return detail
  } catch {
    return null
  }
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { searchParams } = new URL(request.url)
  const { slug } = await context.params
  const qp = QuerySchema.safeParse({ locale: searchParams.get('locale') ?? undefined })
  const locale = qp.success ? qp.data.locale : 'pl'
  const pp = ParamsSchema.safeParse({ slug })
  if (!pp.success) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

  const remote = await fetchFromSupabase(slug, locale)
  if (remote) return NextResponse.json(remote)

  // Fallback to local content
  const { frontmatter, content } = getPostBySlug(slug)
  const postLocale = (frontmatter.locale as SupportedLocale) ?? 'pl'
  if (frontmatter.draft || postLocale !== 'pl') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const detail: BlogPostDetail = {
    slug,
    locale: postLocale,
    title: frontmatter.title,
    description: frontmatter.description ?? '',
    date: frontmatter.date,
    tags: frontmatter.tags ?? [],
    readingTimeMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 220)),
    contentMarkdown: content
  }
  return NextResponse.json(detail)
}


