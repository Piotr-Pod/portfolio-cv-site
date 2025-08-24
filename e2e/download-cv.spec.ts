import { test, expect } from '@playwright/test'

test.describe('Download CV Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pl')
  })

  test('should render download CV button', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /pobierz cv/i })
    
    await expect(downloadButton).toBeVisible()
  })

  test('should show popup when clicked', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /pobierz cv/i })
    
    // Click the button
    await downloadButton.click()
    
    // Check if popup appears
    const popup = page.getByText('CV zostało pobrane!')
    await expect(popup).toBeVisible()
  })
})
