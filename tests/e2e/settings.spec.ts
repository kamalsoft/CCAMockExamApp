import { expect, test } from '@playwright/test'

test('settings page loads', async ({ page }) => {
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Question bank refresh' })).toBeVisible()
})

test('settings page shows the bank version', async ({ page }) => {
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  // Verify bank info in the page
  const section = page.locator('section[aria-labelledby="settings-heading"]')
  await expect(section).toContainText('version')
  await expect(section).toContainText('published')
})

test('settings page shows the schedule in UTC and links to the refresh workflow', async ({ page }) => {
  await page.goto('/#settings')
  await page.waitForLoadState('networkidle')
  const section = page.locator('section[aria-labelledby="settings-heading"]')
  await expect(section).toContainText(/Every \w+ at \d\d:00 UTC/)
  await expect(section).toContainText('Next scheduled check')
  await expect(page.getByRole('link', { name: 'Run a refresh on GitHub' })).toHaveAttribute(
    'href',
    /actions\/workflows\/refresh-bank\.yml$/,
  )
})
