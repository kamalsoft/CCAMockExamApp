import { expect, test } from '@playwright/test'
import { withName } from './session.ts'

// Phone widths: no page should scroll sideways. 360px, Google Pixel 7 and iPhone 14 viewports.
const phones = [
  { name: '360px', width: 360, height: 740 },
  { name: 'Pixel 7', width: 393, height: 851 },
  { name: 'iPhone 14', width: 390, height: 844 },
]
const routes = ['#home', '#bank', '#drill', '#exam', '#walkthrough-d1', '#lab-d1', '#progress', '#settings']

for (const phone of phones) {
  for (const route of routes) {
    test(`no horizontal scroll on ${phone.name}: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: phone.width, height: phone.height })
      await withName(page)
      await page.goto(`/${route}`)
      await page.waitForLoadState('networkidle')
      const overflow = await page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test(`domain links are shown on ${phone.name}`, async ({ page }) => {
    await page.setViewportSize({ width: phone.width, height: phone.height })
    await withName(page)
    await page.goto('/')
    await expect(page.locator('a[href="#drill?domain=d1"]')).toBeVisible()
  })
}
