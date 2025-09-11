import type { CacheStore } from '@/types/p13n'

export class LocalStorageCacheStore<T> implements CacheStore<T> {
  private readonly prefix: string

  constructor(prefix: string = 'p13n') {
    this.prefix = prefix
  }

  private buildKey(key: string): string {
    return `${this.prefix}:${key}`
  }

  async get(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(this.buildKey(key))
      if (!raw) return null
      const parsed = JSON.parse(raw) as { value: T; ts: number }
      return parsed.value
    } catch {
      return null
    }
  }

  async set(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return
    const payload = JSON.stringify({ value, ts: Date.now() })
    window.localStorage.setItem(this.buildKey(key), payload)
  }

  async has(key: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(this.buildKey(key)) !== null
  }

  async invalidate(key: string): Promise<void> {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(this.buildKey(key))
  }
}


