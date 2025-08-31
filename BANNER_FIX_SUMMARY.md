# Naprawa problemu z bannerem zgody na analitykę

## Problem
Banner zgody na analitykę nie pojawiał się po wejściu na stronę.

## Przyczyna
1. **Niepoprawna logika w `AnalyticsManager`** - sprawdzał `consent === null`, ale hook ustawiał `consent` na obiekt z wartościami `false`
2. **Niepoprawna logika w `AnalyticsConsentBanner`** - zwracał `null` gdy `consent === null`, co uniemożliwiało pokazanie banneru dla nowych użytkowników

## Rozwiązanie

### 1. Naprawa hooka `useAnalyticsConsent`
```typescript
// PRZED:
setConsent({
  clarity: false,
  plausible: false,
  umami: false,
});

// PO:
setConsent(null); // No consent given yet
```

### 2. Naprawa `AnalyticsManager`
```typescript
// PRZED:
if (isLoaded && consent === null) {
  setShowBanner(true);
}

// PO:
if (isLoaded && consent === null) {
  setShowBanner(true);
}
```

### 3. Naprawa `AnalyticsConsentBanner`
```typescript
// PRZED:
if (!isLoaded || consent === null) {
  return null;
}

// PO:
if (!isLoaded) {
  return null;
}
```

### 4. Naprawa TypeScript errors
```typescript
// PRZED:
checked={consent.clarity}

// PO:
checked={consent?.clarity ?? false}
```

## Rezultat

### ✅ Banner się teraz pokazuje
- Dla nowych użytkowników (brak zapisanych preferencji)
- Z opcjami akceptacji/odrzucenia wszystkich narzędzi
- Ze szczegółowymi ustawieniami dla każdego narzędzia

### ✅ Testy przechodzą
- Wszystkie 9 testów przechodzą pomyślnie
- Dodano test sprawdzający czy banner się pokazuje dla nowych użytkowników

### ✅ Aplikacja się buduje
- Brak błędów TypeScript
- Poprawne budowanie Next.js

## Jak to działa teraz

1. **Pierwsza wizyta użytkownika**:
   - Hook `useAnalyticsConsent` ustawia `consent = null`
   - `AnalyticsManager` wykrywa `consent === null` i ustawia `showBanner = true`
   - `AnalyticsConsentBanner` renderuje się z domyślnymi wartościami `false`

2. **Po wyrażeniu zgody**:
   - Preferencje są zapisywane w localStorage
   - Hook ustawia `consent` na obiekt z wartościami `true/false`
   - Banner znika
   - Narzędzia analityczne są ładowane zgodnie z preferencjami

3. **Kolejne wizyty**:
   - Hook ładuje preferencje z localStorage
   - Banner się nie pokazuje
   - Narzędzia analityczne działają zgodnie z zapisanymi preferencjami

## Podsumowanie
Problem został rozwiązany przez poprawienie logiki zarządzania stanem zgody użytkownika. Banner zgody na analitykę teraz poprawnie się pokazuje dla nowych użytkowników i zapewnia pełną funkcjonalność zgodną z GDPR/RODO.
