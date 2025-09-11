export type Persona =
  | 'HR'
  | 'NonIT'
  | 'Child10'
  | 'Poet'
  | 'Developer'
  | 'Custom'

export interface PersonaPromptMap {
  HR: string
  NonIT: string
  Child10: string
  Poet: string
  Developer: string
  Custom: string
}

export const DEFAULT_PERSONA_PROMPTS: PersonaPromptMap = {
  HR: 'Przetłumacz wpis dla specjalisty HR, ogranicz żargon techniczny, zachowaj strukturę sekcji i elementy Markdown.',
  NonIT: 'Uprość język i wyjaśnij pojęcia w nawiasach jak dla osoby nietechnicznej z IT, nie zmieniaj struktury i formatowania Markdown.',
  Child10: 'Wyjaśnij prostymi słowami i krótkimi zdaniami jakbym miał 10 lat, zachowując nagłówki i listy Markdown.',
  Poet: 'Nadaj metaforyczny ton bez dodawania faktów, w jednym miejscu treść zamień w krótki wiersz jeśli jest to możliwe, zachowaj strukturę akapitów i Markdown.',
  Developer: 'Przetłumacz dla developera, skup się na technicznych aspektach, decyzjach architektonicznych, konsekwencjach i trade-offach, zachowaj precyzyjne terminy, przykłady i strukturę Markdown.',
  Custom: 'Użyj treści z pola jako persony i tonu dla której przygotujesz treść, tłumacz w Markdown, zachowując fakty i układ.'
}

export interface P13nTranslateRequest {
  postId: string
  persona: Persona
  prompt: string
  contentMarkdown: string
}

export interface P13nTranslateResponse {
  contentMarkdown: string
}

export interface CacheStore<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T): Promise<void>
  has(key: string): Promise<boolean>
  invalidate(key: string): Promise<void>
}


