import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark',
        light: 'github-light'
      },
      keepBackground: false
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        a: [
          ...(defaultSchema.attributes?.a ?? []),
          ['target'],
          ['rel'],
          ['href']
        ],
        img: [
          ...(defaultSchema.attributes?.img ?? []),
          ['src'],
          ['alt'],
          ['title']
        ],
        code: [...(defaultSchema.attributes?.code ?? []), ['className']]
      }
    })
    .use(rehypeStringify)
    .process(markdown)

  return String(file)
}

// Strict Markdown renderer (no MDX, no raw HTML) suitable for user-submitted or LLM-modified content
export async function renderMarkdownStrictToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark',
        light: 'github-light'
      },
      keepBackground: false
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        a: [
          ...(defaultSchema.attributes?.a ?? []),
          ['target'],
          ['rel'],
          ['href']
        ],
        img: [
          ...(defaultSchema.attributes?.img ?? []),
          ['src'],
          ['alt'],
          ['title']
        ],
        code: [...(defaultSchema.attributes?.code ?? []), ['className']]
      }
    })
    .use(rehypeStringify)
    .process(markdown)

  return String(file)
}


