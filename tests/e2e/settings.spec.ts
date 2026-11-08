import { expect, test } from '@playwright/test'

test('settings page loads', async ({ page }) => {
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Bank refresh settings' })).toBeVisible()
})

test('settings page shows the bank version', async ({ page }) => {
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  // Verify bank info in the page
  const section = page.locator('section[aria-labelledby="settings-heading"]')
  await expect(section).toContainText('version')
  await expect(section).toContainText('published')
})

test('settings page saves refresh period choice', async ({ page }) => {
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  await page.getByRole('radio', { name: 'Monthly' }).check()
  await page.reload()
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('radio', { name: 'Monthly' })).toBeChecked()
})
