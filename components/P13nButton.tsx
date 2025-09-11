'use client'

import React from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import type { Persona, PersonaPromptMap } from '@/types/p13n'
import { DEFAULT_PERSONA_PROMPTS } from '@/types/p13n'
import { LocalStorageCacheStore } from '@/lib/cache/local-storage-cache'

interface P13nButtonProps {
  postId: string
  contentMarkdown: string
  onApply(markdown: string): void
  onRestoreOriginal(): void
  onPersonaChange?: (persona: Persona | null) => void
  openMenu?: boolean
  onMenuOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
}

type MenuPersona = Exclude<Persona, never>

const cache = new LocalStorageCacheStore<{ markdown: string; ts: number }>('p13n')

export function P13nButton(props: P13nButtonProps) {
  const { postId, contentMarkdown, onApply, onRestoreOriginal, onPersonaChange, openMenu, onMenuOpenChange, disabled, className } = props
  const t = useTranslations('p13n')
  
  const MENU_ITEMS = React.useMemo(() => [
    { id: 'HR' as MenuPersona, label: t('personas.HR') },
    { id: 'NonIT' as MenuPersona, label: t('personas.NonIT') },
    { id: 'Child10' as MenuPersona, label: t('personas.Child10') },
    { id: 'Poet' as MenuPersona, label: t('personas.Poet') },
    { id: 'Developer' as MenuPersona, label: t('personas.Developer') },
    { id: 'Custom' as MenuPersona, label: t('personas.Custom') }
  ], [t])
  const [open, setOpen] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [customPrompt, setCustomPrompt] = React.useState('')
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const [hasApplied, setHasApplied] = React.useState(false)
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null)
  const [notification, setNotification] = React.useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isHovered, setIsHovered] = React.useState(false)
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

    function onClickOutside(e: MouseEvent) {
      if (!open) return
      const target = e.target as Node
      const container = menuRef.current?.parentElement
      
      // Check if click is outside the entire component (button + menu)
      if (container && !container.contains(target)) {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('mousedown', onClickOutside)
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onClickOutside)
    }
  }, [open])

  // Auto-hide notifications
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Handle external menu control
  React.useEffect(() => {
    if (openMenu === true && !open) {
      setOpen(true)
    }
  }, [openMenu, open])

  // Notify parent about menu state changes (only when menu closes)
  React.useEffect(() => {
    if (!open && onMenuOpenChange) {
      onMenuOpenChange(false)
    }
  }, [open, onMenuOpenChange])

  // Notify parent about persona changes
  React.useEffect(() => {
    onPersonaChange?.(selectedPersona)
  }, [selectedPersona, onPersonaChange])

  const send = React.useCallback(async (persona: Persona, prompt: string) => {
    setBusy(true)
    setProgress(10)
    
    // Close menus immediately after selection
    setOpen(false)
    setSheetOpen(false)
    
    try {
      const cacheKey = `${postId}:${persona}`
      const cached = await cache.get(cacheKey)
      if (cached?.markdown) {
        onApply(cached.markdown)
        setHasApplied(true)
        setSelectedPersona(persona)
        
        // Show success notification
        const personaLabel = MENU_ITEMS.find(item => item.id === persona)?.label || persona
        setNotification({
          type: 'success',
          message: t('notifications.success', { persona: personaLabel })
        })
        return
      }

      setProgress(25)
      const res = await fetch('/api/p13n-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, persona, prompt, contentMarkdown })
      })
      setProgress(60)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      const data = (await res.json()) as { contentMarkdown: string }
      setProgress(90)
      await cache.set(cacheKey, { markdown: data.contentMarkdown, ts: Date.now() })
      onApply(data.contentMarkdown)
      setHasApplied(true)
      setSelectedPersona(persona)
      setProgress(100)
      
      // Show success notification
      const personaLabel = MENU_ITEMS.find(item => item.id === persona)?.label || persona
      setNotification({
        type: 'success',
        message: t('notifications.success', { persona: personaLabel })
      })
    } catch (error) {
      console.error('P13n translation failed:', error)
      setNotification({
        type: 'error',
        message: t('notifications.error', { error: error instanceof Error ? error.message : 'Unknown error' })
      })
    } finally {
      setBusy(false)
      setTimeout(() => setProgress(0), 600)
    }
  }, [postId, contentMarkdown, onApply, MENU_ITEMS, t])

  const onSelect = React.useCallback((persona: Persona) => {
    const prompts: PersonaPromptMap = DEFAULT_PERSONA_PROMPTS
    const p = persona === 'Custom' ? (customPrompt || DEFAULT_PERSONA_PROMPTS.Custom) : prompts[persona]
    void send(persona, p)
  }, [customPrompt, send])

  // Desktop menu content
  const DesktopMenuContent = React.useMemo(() => (
    <>
      {MENU_ITEMS.map((m) => (
        <button
          key={m.id}
          role="menuitem"
          className="flex items-center justify-between w-full cursor-pointer rounded px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          onClick={() => onSelect(m.id)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSelect(m.id) } }}
          disabled={busy}
        >
          <span>{m.label}</span>
          {selectedPersona === m.id && (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </button>
      ))}

      <div className="border-t pt-2 mt-2">
        <label htmlFor="p13n-custom-desktop" className="mb-1 block text-sm">
          {t('menu.customLabel')}
        </label>
        <input
          id="p13n-custom-desktop"
          className="w-full rounded border bg-background px-3 py-2 text-sm"
          placeholder={t('menu.customPlaceholder')}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          maxLength={800}
        />
        <div className="mt-2 flex justify-end">
          <Button 
            type="button" 
            size="sm" 
            onClick={() => onSelect('Custom')} 
            disabled={busy || !customPrompt.trim()}
          >
            {t('buttons.applyCustom')}
          </Button>
        </div>
      </div>
    </>
  ), [MENU_ITEMS, selectedPersona, customPrompt, busy, t, onSelect])

  // Mobile menu content
  const MobileMenuContent = React.useMemo(() => (
    <>
      {MENU_ITEMS.map((m) => (
        <button
          key={m.id}
          role="menuitem"
          className="flex items-center justify-between w-full cursor-pointer rounded px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border-b border-border/50 last:border-0"
          onClick={() => onSelect(m.id)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSelect(m.id) } }}
          disabled={busy}
        >
          <span>{m.label}</span>
          {selectedPersona === m.id && (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </button>
      ))}

      <div className="border-t pt-2 mt-4">
        <label htmlFor="p13n-custom-mobile" className="mb-1 block text-sm">
          {t('menu.customLabel')}
        </label>
        <input
          id="p13n-custom-mobile"
          className="w-full rounded border bg-background px-3 py-2 text-sm"
          placeholder={t('menu.customPlaceholder')}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          maxLength={800}
        />
        <div className="mt-2 flex justify-end">
          <Button 
            type="button" 
            size="sm" 
            onClick={() => onSelect('Custom')} 
            disabled={busy || !customPrompt.trim()}
          >
            {t('buttons.applyCustom')}
          </Button>
        </div>
      </div>
    </>
  ), [MENU_ITEMS, selectedPersona, customPrompt, busy, t, onSelect])

  // Helper function to get button text
  const getButtonText = () => {
    if (busy) {
      return (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('buttons.customizing', { progress })}
        </span>
      )
    }
    
    if (selectedPersona && hasApplied) {
      const personaLabel = MENU_ITEMS.find(item => item.id === selectedPersona)?.label || selectedPersona
      return t('buttons.readingAs', { persona: personaLabel })
    }
    
    return t('buttons.customize')
  }

  return (
    <div className={cn('relative inline-flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        {/* Desktop Button */}
        <div className="relative hidden md:inline-flex">
          <Button
            type="button"
            variant="outline"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-busy={busy}
            disabled={disabled || busy}
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full"
          >
            {getButtonText()}
          </Button>
          
          {/* Tooltip */}
          {isHovered && selectedPersona && hasApplied && !busy && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-50">
{t('buttons.changeAudience')}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        {/* Mobile Sheet */}
        <div className="relative md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-busy={busy}
                disabled={disabled || busy}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full"
              >
                {getButtonText()}
              </Button>
            </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>{t('buttons.customize')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col space-y-4" role="menu" aria-label={t('menu.ariaLabel')}>
              {MobileMenuContent}
            </div>
          </SheetContent>
          </Sheet>
          
          {/* Mobile Tooltip */}
          {isHovered && selectedPersona && hasApplied && !busy && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-50">
{t('buttons.changeAudience')}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        {hasApplied && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => { 
              onRestoreOriginal(); 
              setHasApplied(false); 
              setSelectedPersona(null);
              setNotification({
                type: 'success',
                message: t('notifications.restored')
              });
            }} 
            disabled={busy}
          >
{t('buttons.restoreOriginal')}
          </Button>
        )}
      </div>
      
      <p className="text-xs italic text-muted-foreground">
{t('disclaimer')}
      </p>

      {/* Desktop Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 min-w-[260px] rounded-md border bg-popover p-2 text-popover-foreground shadow-md focus:outline-none hidden md:block"
          role="menu"
          aria-label={t('menu.ariaLabel')}
          ref={menuRef}
        >
          {/* Close button header */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{t('menu.title')}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
              aria-label={t('menu.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
{DesktopMenuContent}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg border max-w-sm",
            notification.type === 'success' 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-red-50 border-red-200 text-red-800"
          )}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default P13nButton


