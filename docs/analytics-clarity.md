# Microsoft Clarity - Analiza Behawioralna

## Przegląd

Microsoft Clarity to narzędzie do analizy behawioralnej użytkowników, które umożliwia:
- Nagrywanie sesji użytkowników
- Generowanie map cieplnych (heatmaps)
- Analizę wzorców kliknięć i scrollowania
- Identyfikację problemów z UX

## Konfiguracja

### 1. Zmienne środowiskowe

Dodaj do pliku `.env.local`:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id_here
```

### 2. Uzyskanie Project ID

1. Przejdź do [Microsoft Clarity](https://clarity.microsoft.com/)
2. Zaloguj się lub utwórz konto
3. Utwórz nowy projekt dla swojej domeny
4. Skopiuj Project ID z ustawień projektu

### 3. Implementacja

Microsoft Clarity jest automatycznie ładowane przez `AnalyticsManager` w `app/[locale]/layout.tsx`:

```tsx
<AnalyticsManager
  clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
  // ... inne narzędzia analityczne
/>
```

## Zgodność z GDPR

### Zgoda użytkownika

Microsoft Clarity jest ładowane tylko po uzyskaniu zgody użytkownika. System zarządzania zgodą:

- Wyświetla banner z opcjami zgody
- Zapisuje preferencje w localStorage
- Respektuje wybory użytkownika
- Umożliwia zmianę ustawień w dowolnym momencie

### Komponenty

1. **`useAnalyticsConsent`** - Hook do zarządzania zgodą
2. **`AnalyticsConsentBanner`** - Banner z opcjami zgody
3. **`AnalyticsManager`** - Główny komponent zarządzający analityką
4. **`Clarity`** - Komponent Microsoft Clarity

## Funkcjonalności

### Nagrywanie sesji
- Automatyczne nagrywanie sesji użytkowników
- Możliwość wyłączenia dla określonych stron
- Konfigurowalny delay przed rozpoczęciem nagrywania

### Mapy cieplne
- Heatmaps kliknięć
- Heatmaps scrollowania
- Heatmaps ruchu myszy

### Konfiguracja

```tsx
<Clarity 
  projectId="your-project-id"
  config={{
    sessionReplay: true,    // Nagrywanie sesji
    heatmap: true,          // Mapy cieplne
    delay: 1000,           // Opóźnienie w ms
    cookieDomain: 'example.com'
  }}
/>
```

## Testowanie

### Uruchomienie testów

```bash
npm test -- analytics.test.tsx
```

### Testy obejmują

- Poprawne ładowanie skryptu Clarity
- Respektowanie zgody użytkownika
- Funkcjonalność banneru zgody
- Aktualizację preferencji użytkownika

## Monitorowanie

### Dashboard Clarity

Po skonfigurowaniu możesz monitorować:

1. **Sesje** - Nagrane sesje użytkowników
2. **Heatmaps** - Mapy cieplne interakcji
3. **Insights** - Automatyczne wykrywanie problemów
4. **Recordings** - Szczegółowe nagrania sesji

### Metryki

- Liczba sesji
- Czas spędzony na stronie
- Wzorce scrollowania
- Problemy z UX (dead clicks, rage clicks)

## Bezpieczeństwo

### Prywatność

- Clarity nie zbiera danych osobowych
- Możliwość wyłączenia dla określonych regionów
- Zgodność z GDPR/RODO

### Konfiguracja bezpieczeństwa

```tsx
// Wyłączenie dla określonych stron
if (window.location.pathname.includes('/admin')) {
  return null;
}

// Wyłączenie dla określonych regionów
if (userRegion === 'EU' && !hasConsent) {
  return null;
}
```

## Troubleshooting

### Problem: Clarity nie ładuje się

1. Sprawdź czy `NEXT_PUBLIC_CLARITY_PROJECT_ID` jest ustawione
2. Sprawdź czy użytkownik wyraził zgodę
3. Sprawdź konsolę przeglądarki pod kątem błędów

### Problem: Brak danych w dashboardzie

1. Poczekaj 24-48 godzin na pierwsze dane
2. Sprawdź czy skrypt jest ładowany (Network tab)
3. Sprawdź czy nie ma blokad ad-blocker

### Problem: Zgoda nie jest zapisywana

1. Sprawdź czy localStorage jest dostępne
2. Sprawdź czy nie ma błędów w konsoli
3. Sprawdź implementację hooka `useAnalyticsConsent`

## Najlepsze praktyki

1. **Zgoda użytkownika** - Zawsze pytaj o zgodę przed ładowaniem
2. **Transparentność** - Wyjaśnij użytkownikom co zbierasz
3. **Minimalizacja** - Zbieraj tylko niezbędne dane
4. **Bezpieczeństwo** - Regularnie przeglądaj ustawienia prywatności
5. **Testowanie** - Testuj w środowisku deweloperskim przed wdrożeniem

## Integracja z innymi narzędziami

Microsoft Clarity współpracuje z:

- **Plausible Analytics** - Anonimowa analityka ruchu
- **Vercel Analytics** - Metryki wydajności
- **Google Analytics** - (jeśli używane)

Wszystkie narzędzia są zarządzane przez `AnalyticsManager` i respektują preferencje użytkownika.
