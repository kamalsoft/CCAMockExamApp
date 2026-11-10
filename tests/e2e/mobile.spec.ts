import { expect, test } from '@playwright/test'
import { withName } from './session.ts'

// Phone width: no page should scroll sideways.
const routes = ['#home', '#bank', '#drill', '#exam', '#walkthrough-d1', '#lab-d1', '#progress', '#settings']

for (const route of routes) {
  test(`no horizontal scroll at 360px wide: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await withName(page)
    await page.goto(`/${route}`)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
