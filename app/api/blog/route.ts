import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAllPosts } from '@/lib/blog'
import type { BlogPostIndexItem, SupportedLocale } from '@/lib/blog-model'

const QuerySchema = z.object({
  locale: z.union([z.literal('pl'), z.literal('en')]).default('pl')
})

async function fetchFromSupabase(locale: SupportedLocale): Promise<BlogPostIndexItem[] | null> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  try {
    // Placeholder: adjust to your schema. Expected REST table "blog_posts" exposed via PostgREST
    const url = `${supabaseUrl}/rest/v1/blog_posts?locale=eq.${locale}&draft=is.false&select=slug,locale,title,description,date,tags,coverImageUrl,authorName,authorAvatar,readingTimeMinutes&order=date.desc`
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      // Avoid caching for now; adapt as needed
      cache: 'no-store'
    })
    if (!res.ok) return null
    const rows: any[] = await res.json()
    const posts: BlogPostIndexItem[] = rows.map((r) => ({
      slug: r.slug,
      locale: (r.locale as SupportedLocale) ?? 'pl',
      title: r.title,
      description: r.description ?? '',
      date: r.date,
      tags: Array.isArray(r.tags) ? r.tags : [],
      coverImageUrl: r.coverImageUrl ?? undefined,
      author: r.authorName ? { name: r.authorName as string, avatarUrl: r.authorAvatar ?? undefined } : undefined,
      readingTimeMinutes: typeof r.readingTimeMinutes === 'number' ? r.readingTimeMinutes : 1
    }))
    return posts
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parse = QuerySchema.safeParse({ locale: searchParams.get('locale') ?? undefined })
  const locale = parse.success ? parse.data.locale : 'pl'

  // Try Supabase first
  const remote = await fetchFromSupabase(locale)
  if (remote && remote.length > 0) return NextResponse.json(remote)

  // Fallback to local content
  const local = getAllPosts(locale)
  return NextResponse.json(local)
}


