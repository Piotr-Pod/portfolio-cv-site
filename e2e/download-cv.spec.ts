import { test, expect } from '@playwright/test'

test.describe('Download CV Button', () => {
  test.beforeEach(async ({ page }) => {
    // First login to access the protected page
    await page.goto('/pl/login')
    
    // Fill in the password
    const password = process.env.SITE_PASSWORD || 'test123'
    await page.fill('input[type="password"]', password)
    
    // Click login button
    await page.click('button:has-text("Zaloguj się")')
    
    // Wait for redirect to main page
    await page.waitForURL('/pl')
  })

  test('should render download CV button', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    
    await expect(downloadButton).toBeVisible()
  })

  test('should open CV download modal when clicked', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    
    // Click the button
    await downloadButton.click()
    
    // Check if modal appears
    await expect(page.getByText('Pobierz CV')).toBeVisible()
    await expect(page.getByText('Zgoda na przetwarzanie danych osobowych (RODO)')).toBeVisible()
  })

  test('should require GDPR consent to enable download', async ({ page }) => {
    // Open modal
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    await downloadButton.click()
    
    // Download button should be disabled initially
    const modalDownloadButton = page.getByRole('button', { name: /Pobierz CV/i }).last()
    await expect(modalDownloadButton).toBeDisabled()
    
    // Check GDPR consent
    await page.getByRole('checkbox').check()
    
    // Download button should now be enabled
    await expect(modalDownloadButton).toBeEnabled()
  })

  test('should fill optional fields', async ({ page }) => {
    // Open modal
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    await downloadButton.click()
    
    // Fill optional fields
    await page.fill('#fullName', 'Jan Kowalski')
    await page.fill('#company', 'ACME Corp')
    await page.fill('#contact', 'jan.kowalski@acme.pl')
    await page.fill('#justification', 'Rekrutacja na stanowisko Senior Java Developer')
    
    // Verify fields are filled
    await expect(page.locator('#fullName')).toHaveValue('Jan Kowalski')
    await expect(page.locator('#company')).toHaveValue('ACME Corp')
    await expect(page.locator('#contact')).toHaveValue('jan.kowalski@acme.pl')
    await expect(page.locator('#justification')).toHaveValue('Rekrutacja na stanowisko Senior Java Developer')
  })

  test('should close modal when cancel is clicked', async ({ page }) => {
    // Open modal
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    await downloadButton.click()
    
    // Click cancel
    await page.getByRole('button', { name: /Anuluj/i }).click()
    
    // Modal should be closed
    await expect(page.getByText('Pobierz CV')).not.toBeVisible()
  })

  test('should close modal when X button is clicked', async ({ page }) => {
    // Open modal
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    await downloadButton.click()
    
    // Click X button
    await page.getByRole('button').filter({ hasText: '×' }).click()
    
    // Modal should be closed
    await expect(page.getByText('Pobierz CV')).not.toBeVisible()
  })
})
