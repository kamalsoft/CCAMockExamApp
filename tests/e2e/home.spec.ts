import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'CCA Mock Exam' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Get started with a mode' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Domain Drill' })).toBeVisible()
})

test('mock exam page loads from home', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="#exam"]')
  await expect(page.getByRole('heading', { level: 2, name: 'Mock exam' })).toBeVisible()
})

test('drill page loads from home', async ({ page }) => {
  await page.goto('#drill')
  await expect(page.getByRole('heading', { name: 'Domain drill' })).toBeVisible()
})
