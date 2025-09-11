'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Persona, PersonaPromptMap } from '@/types/p13n'
import { DEFAULT_PERSONA_PROMPTS } from '@/types/p13n'
import { LocalStorageCacheStore } from '@/lib/cache/local-storage-cache'

interface P13nButtonProps {
  postId: string
  contentMarkdown: string
  onApply(markdown: string): void
  onRestoreOriginal(): void
  disabled?: boolean
  className?: string
}

type MenuPersona = Exclude<Persona, never>

const MENU_ITEMS: { id: MenuPersona; label: string }[] = [
  { id: 'HR', label: 'HR' },
  { id: 'NonIT', label: 'Czytelnik spoza IT' },
  { id: 'Child10', label: 'Dziecko 10 lat' },
  { id: 'Poet', label: 'Poeta' },
  { id: 'Developer', label: 'Developer' },
  { id: 'Custom', label: 'Własny opis' }
]

const cache = new LocalStorageCacheStore<{ markdown: string; ts: number }>('p13n')

export function P13nButton(props: P13nButtonProps) {
  const { postId, contentMarkdown, onApply, onRestoreOriginal, disabled, className } = props
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [customPrompt, setCustomPrompt] = React.useState('')
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const [hasApplied, setHasApplied] = React.useState(false)
  // Debug: show all available env variables
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[p13n] All process.env keys:', Object.keys(process.env))
    // eslint-disable-next-line no-console
    console.log('[p13n] NEXT_PUBLIC_ env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')))
    // eslint-disable-next-line no-console
    console.log('[p13n] Raw NEXT_PUBLIC_P13N_ENABLED:', JSON.stringify(process.env.NEXT_PUBLIC_P13N_ENABLED))
  }, [])

  const p13nEnv = process.env.NEXT_PUBLIC_P13N_ENABLED
  // Tymczasowo: jeśli zmienna jest undefined, pokaż przycisk dla debugowania
  const p13nEnabled = p13nEnv === 'true' || p13nEnv === undefined
  
  // eslint-disable-next-line no-console
  console.log('[p13n] P13nButton render check', { 
    NEXT_PUBLIC_P13N_ENABLED: p13nEnv, 
    p13nEnabled,
    comparison: `"${p13nEnv}" === "true" = ${p13nEnv === 'true'}`,
    isUndefined: p13nEnv === undefined,
    willRender: p13nEnabled
  })

  // Don't render if p13n is disabled (ale pozwól na undefined dla debugowania)
  if (!p13nEnabled) {
    // eslint-disable-next-line no-console
    console.log('[p13n] P13nButton hidden: NEXT_PUBLIC_P13N_ENABLED is not "true"', { p13nEnv })
    return null
  }

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return
      const focusable = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
      if (!focusable || focusable.length === 0) return
      const currentIndex = Array.from(focusable).findIndex((el) => el === document.activeElement)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = focusable[(currentIndex + 1 + focusable.length) % focusable.length]
        next?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = focusable[(currentIndex - 1 + focusable.length) % focusable.length]
        prev?.focus()
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const send = async (persona: Persona, prompt: string) => {
    setBusy(true)
    setProgress(10)
    try {
      const cacheKey = `${postId}:${persona}`
      const cached = await cache.get(cacheKey)
      if (cached?.markdown) {
        onApply(cached.markdown)
        setHasApplied(true)
        return
      }

      setProgress(25)
      const res = await fetch('/api/p13n-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, persona, prompt, contentMarkdown })
      })
      setProgress(60)
      if (!res.ok) throw new Error('Translation failed')
      const data = (await res.json()) as { contentMarkdown: string }
      setProgress(90)
      await cache.set(cacheKey, { markdown: data.contentMarkdown, ts: Date.now() })
      onApply(data.contentMarkdown)
      setHasApplied(true)
      setProgress(100)
    } finally {
      setBusy(false)
      setOpen(false)
      setTimeout(() => setProgress(0), 600)
    }
  }

  const onSelect = (persona: Persona) => {
    const prompts: PersonaPromptMap = DEFAULT_PERSONA_PROMPTS
    const p = persona === 'Custom' ? (customPrompt || DEFAULT_PERSONA_PROMPTS.Custom) : prompts[persona]
    void send(persona, p)
  }

  return (
    <div className={cn('relative inline-flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-busy={busy}
          disabled={disabled || busy}
          onClick={() => setOpen((v) => !v)}
        >
          {busy ? `Dostosowywanie... ${progress}%` : 'Dostosuj tekst'}
        </Button>

        {hasApplied && (
          <Button type="button" variant="outline" onClick={() => { onRestoreOriginal(); setHasApplied(false) }} disabled={busy}>
            Przywróć oryginał
          </Button>
        )}
      </div>
      
      <p className="text-xs italic text-muted-foreground">
        Eksperymentalne dostosowanie treści wpisu przez AI do odbiorcy. Wyniki mogą być nieprzewidziane.
      </p>

      {open && (
        <div
          className="absolute z-50 mt-2 min-w-[260px] rounded-md border bg-popover p-2 text-popover-foreground shadow-md focus:outline-none"
          role="menu"
          aria-label="Personalizacja treści"
          ref={menuRef}
        >
          {MENU_ITEMS.map((m) => (
            <button
              key={m.id}
              role="menuitem"
              className="block w-full cursor-pointer rounded px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={() => onSelect(m.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSelect(m.id) } }}
              disabled={busy}
            >
              {m.label}
            </button>
          ))}

          <div className="mt-2 border-t pt-2">
            <label htmlFor="p13n-custom" className="mb-1 block text-sm">Własny opis</label>
            <input
              id="p13n-custom"
              className="w-full rounded border bg-background px-3 py-2 text-sm"
              placeholder="Opisz personę i ton..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              maxLength={800}
            />
            <div className="mt-2 flex justify-end">
              <Button type="button" size="sm" onClick={() => onSelect('Custom')} disabled={busy || !customPrompt.trim()}>
                Zastosuj własny opis
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default P13nButton


