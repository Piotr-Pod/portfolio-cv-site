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

  test('should show popup when clicked', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /Pobierz CV/i })
    
    // Click the button
    await downloadButton.click()
    
    // Check if popup appears
    const popup = page.getByText('CV zostało pobrane!')
    await expect(popup).toBeVisible()
  })
})
