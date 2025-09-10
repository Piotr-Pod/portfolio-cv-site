import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogFrontmatter {
  title: string
  description?: string
  date: string
  tags?: string[]
  locale?: 'pl' | 'en'
  draft?: boolean
}

export interface BlogPostIndexItem {
  slug: string
  locale: 'pl' | 'en'
  title: string
  description: string
  date: string
  tags: string[]
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

function readDirectorySafe(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return []
  return fs.readdirSync(dirPath)
}

export function getPostSlugs(): string[] {
  return readDirectorySafe(CONTENT_DIR).filter((name) => {
    const mdx = path.join(CONTENT_DIR, name, 'index.mdx')
    const md = path.join(CONTENT_DIR, name, 'index.md')
    return fs.existsSync(mdx) || fs.existsSync(md)
  })
}

export function getPostBySlug(slug: string) {
  const mdxPath = path.join(CONTENT_DIR, slug, 'index.mdx')
  const mdPath = path.join(CONTENT_DIR, slug, 'index.md')
  const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath
  const file = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(file)
  return { frontmatter: data as BlogFrontmatter, content }
}

export function getAllPosts(locale: 'pl' | 'en'): BlogPostIndexItem[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => {
      const { frontmatter } = getPostBySlug(slug)
      const fm = frontmatter
      if (fm.draft) return null
      const postLocale = (fm.locale as 'pl' | 'en') ?? 'pl'
      if (postLocale !== locale) return null
      return {
        slug,
        locale: postLocale,
        title: fm.title,
        description: fm.description ?? '',
        date: fm.date,
        tags: fm.tags ?? [],
      } satisfies BlogPostIndexItem
    })
    .filter(Boolean) as BlogPostIndexItem[]

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}


