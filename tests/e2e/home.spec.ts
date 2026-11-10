import { expect, test } from '@playwright/test'
import { withName } from './session.ts'

test('home asks for a name before showing the navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('What should we call you?')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toHaveCount(0)
})

test('entering a name shows the navigation, and logout asks again', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('What should we call you?').fill('Tester')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome back, Tester!' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toBeVisible()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page.getByLabel('What should we call you?')).toBeVisible()
})

test('home page loads', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'CCA Mock Exam', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Get started with a mode' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Domain Drill' })).toBeVisible()
})

test('question bank card shows the question count, not the bank version', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Question Bank/ })).toContainText(/\d+ questions · version \d+/)
})

test('mock exam page loads from home', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  await page.click('a[href="#exam"]')
  await expect(page.getByRole('heading', { level: 2, name: 'Mock exam' })).toBeVisible()
})

test('drill page loads from home', async ({ page }) => {
  await page.goto('#drill')
  await expect(page.getByRole('heading', { name: 'Domain drill' })).toBeVisible()
})
