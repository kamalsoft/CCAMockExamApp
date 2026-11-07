import { expect, test } from '@playwright/test'

// Phone width: no page should scroll sideways.
const routes = ['#drill', '#exam', '#walkthrough-d1', '#lab-d1', '#progress']

for (const route of routes) {
  test(`no horizontal scroll at 360px wide: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto(`/${route}`)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
