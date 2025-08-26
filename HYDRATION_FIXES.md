# Hydration Error Fixes

## Problem
Aplikacja miała błędy hydration w Next.js 15, które powodowały niezgodność między renderowaniem po stronie serwera (SSR) a klienta.

## Rozwiązania

### 1. **ThemeProvider** - Problem z localStorage i window
**Problem:** Używanie `localStorage` i `window` w `useEffect` powodowało różnice między SSR a klientem.

**Rozwiązanie:**
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  // Dopiero teraz używaj localStorage i window
}, []);

useEffect(() => {
  if (!mounted) return;
  // Operacje na DOM
}, [theme, mounted]);
```

### 2. **Layout** - Dodanie suppressHydrationWarning
**Problem:** Tag `<html>` i `<body>` miały różne atrybuty między SSR a klientem.

**Rozwiązanie:**
```typescript
<html lang={locale} suppressHydrationWarning>
<body className={...} suppressHydrationWarning>
```

### 3. **Navigation** - Problem z window.location
**Problem:** Używanie `window.location.pathname` i `window.scrollTo` bez sprawdzenia czy jesteśmy po stronie klienta.

**Rozwiązanie:**
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  if (typeof window !== 'undefined') {
    setCurrentPathname(window.location.pathname);
  }
}, []);

const scrollToTop = () => {
  if (!mounted) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### 4. **ContactSection** - Problem z window.open
**Problem:** Używanie `window.open` i `window.location.href` bez sprawdzenia czy jesteśmy po stronie klienta.

**Rozwiązanie:**
```typescript
const handleCalendarClick = () => {
  if (!mounted) return;
  window.open('https://cal.com/your-username', '_blank');
};
```

### 5. **API Route** - Problem z Date.now()
**Problem:** Używanie `Date.now()` może powodować różnice w czasie.

**Rozwiązanie:**
```typescript
const now = new Date().getTime();
```

### 6. **Next.js 15 Compatibility**
**Problem:** Next.js 15 wymaga awaitowania `params` i `headers()`.

**Rozwiązanie:**
```typescript
// Layout
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // ...
}

// i18n
export default getRequestConfig(async ({ locale }) => {
  // locale jest już awaitowane przez next-intl
});
```

### 7. **next/link** - Usunięcie prop locale
**Problem:** W Next.js 15 z App Router, prop `locale` w `next/link` nie jest obsługiwany.

**Rozwiązanie:**
```typescript
// Przed
<Link href={makeLocaleHref('pl')} locale="pl">PL</Link>

// Po
<Link href={makeLocaleHref('pl')}>PL</Link>
```

## Najlepsze praktyki

1. **Zawsze sprawdzaj czy jesteś po stronie klienta** przed użyciem `window`, `localStorage`, `sessionStorage`
2. **Używaj `suppressHydrationWarning`** dla elementów, które mogą się różnić między SSR a klientem
3. **Awaituj `params` i `headers()`** w Next.js 15
4. **Nie używaj prop `locale`** w `next/link` z App Router
5. **Używaj `mounted` state** do kontrolowania renderowania komponentów zależnych od klienta

## Testowanie

Po wprowadzeniu poprawek:
- ✅ Build przechodzi bez błędów
- ✅ Brak błędów hydration w konsoli
- ✅ Aplikacja działa poprawnie w trybie development i production
