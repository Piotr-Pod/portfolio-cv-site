'use client'

import React from 'react'
import P13nButton from '@/components/P13nButton'

interface PersonalizedPostProps {
  postId: string
  initialMarkdown: string
}

export function PersonalizedPost({ postId, initialMarkdown }: PersonalizedPostProps) {
  const [original] = React.useState(initialMarkdown)
  const [markdown, setMarkdown] = React.useState(initialMarkdown)
  const [html, setHtml] = React.useState<string>('')

  // Debug: component mount and props check
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.debug('[p13n] PersonalizedPost mounted', {
        postId,
        initialMarkdownLen: initialMarkdown?.length ?? 0,
        NEXT_PUBLIC_P13N_ENABLED: process.env.NEXT_PUBLIC_P13N_ENABLED
      })
    }
  }, [postId, initialMarkdown])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/markdown/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown })
        })
        if (!res.ok) throw new Error('render failed')
        const data = (await res.json()) as { html: string }
        const h = data.html
        if (!cancelled) setHtml(h)
      } catch {
        if (!cancelled) setHtml('<p class="text-red-600">Nie udało się wyrenderować treści.</p>')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [markdown])

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <P13nButton
          postId={postId}
          contentMarkdown={original}
          onApply={(m) => setMarkdown(m)}
          onRestoreOriginal={() => setMarkdown(original)}
        />
      </div>
      <article className="mt-4" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default PersonalizedPost


