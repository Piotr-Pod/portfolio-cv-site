# Testy Interfejsu - Download CV Button

Ten katalog zawiera uproszczone testy dla przycisku "Download CV" w komponencie `HeroSection`.

## Struktura testów

### 1. Testy jednostkowe (`HeroSection.test.tsx`)
- **Renderowanie**: Sprawdza czy przycisk renderuje się poprawnie
- **Kliknięcie**: Testuje czy kliknięcie wywołuje funkcję `handleDownloadCV`
- **Popup**: Sprawdza czy pojawia się powiadomienie po kliknięciu

### 2. Testy e2e (`e2e/download-cv.spec.ts`)
- **Renderowanie**: Sprawdza czy przycisk jest widoczny w przeglądarce
- **Interakcja**: Testuje kliknięcie i wyświetlanie popup w rzeczywistym środowisku

## Uruchamianie testów

### Testy jednostkowe
```bash
# Wszystkie testy
npm test

# Testy w trybie watch
npm run test:watch
```

### Testy e2e
```bash
# Wszystkie testy e2e
npm run test:e2e

# Testy z UI
npm run test:e2e:ui
```

## Pokrycie testowe

Testy sprawdzają:

### Funkcjonalność
- ✅ Przycisk renderuje się poprawnie
- ✅ Kliknięcie wywołuje funkcję `handleDownloadCV`
- ✅ Pojawia się popup po kliknięciu

### E2E
- ✅ Przycisk jest widoczny w przeglądarce
- ✅ Kliknięcie działa w rzeczywistym środowisku

## Konfiguracja

### Jest (`jest.config.js`)
- Next.js integration
- TypeScript support
- Module mapping (`@/` alias)

### Playwright (`playwright.config.ts`)
- Multiple browsers
- Screenshot on failure

## Dodawanie nowych testów

### Test jednostkowy
```typescript
it('should do something', async () => {
  const user = userEvent.setup()
  render(<HeroSection />)
  
  const button = screen.getByRole('button', { name: /downloadcv/i })
  await user.click(button)
  
  expect(screen.getByText('CV zostało pobrane!')).toBeInTheDocument()
})
```

### Test e2e
```typescript
test('should work in browser', async ({ page }) => {
  await page.goto('/')
  
  const button = page.getByRole('button', { name: /downloadcv/i })
  await button.click()
  
  await expect(page.getByText('CV zostało pobrane!')).toBeVisible()
})
```

## CI/CD Integration

Testy są zintegrowane z GitHub Actions:

```yaml
- name: Run tests
  run: npm test

- name: Run e2e tests
  run: npm run test:e2e
```
