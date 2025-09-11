export type SupportedLocale = 'pl' | 'en'

export interface BlogAuthor {
  name: string
  avatarUrl?: string
}

export interface BlogSeo {
  title?: string
  description?: string
  ogImageUrl?: string
}

export interface BlogPostIndexItem {
  slug: string
  locale: SupportedLocale
  title: string
  description: string
  date: string
  tags: string[]
  coverImageUrl?: string
  author?: BlogAuthor
  readingTimeMinutes: number
}

export interface BlogPostDetail extends BlogPostIndexItem {
  contentMarkdown: string
  draft?: boolean
  seo?: BlogSeo
}


