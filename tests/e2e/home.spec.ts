import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { withName } from './session.ts'

const bank = JSON.parse(readFileSync(new URL('../../content/bank/questions.json', import.meta.url), 'utf8'))

test('home asks for a name before showing the navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('What should we call you?')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toHaveCount(0)
})

test('entering a name shows the navigation, and logout asks again after a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('What should we call you?').fill('Tester')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome back, Tester!' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toBeVisible()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page.getByLabel('What should we call you?')).toBeVisible()
  expect(await page.evaluate("sessionStorage.getItem('cca-user-v1')")).toBeNull()
  await page.reload()
  await expect(page.getByLabel('What should we call you?')).toBeVisible()
})

test('the name is trimmed, kept for the tab on reload, and not kept in local storage', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('What should we call you?').fill('  Ada  ')
  await page.getByRole('button', { name: 'Continue' }).click()
  expect(await page.evaluate("sessionStorage.getItem('cca-user-v1')")).toBe('Ada')
  expect(await page.evaluate("localStorage.getItem('cca-user-v1')")).toBeNull()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Welcome back, Ada!' })).toBeVisible()
})

test('home page loads', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'CCA Mock Exam', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Get started with a mode' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Exam' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Domain Drill' })).toBeVisible()
})

test('navigation cards and domain links point to each mode', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  const hrefs = {
    'Mock Exam': '#exam',
    'Question Bank': '#bank',
    'Domain Drill': '#drill',
    Walkthroughs: '#walkthrough',
    Labs: '#lab',
    Progress: '#progress',
    Settings: '#settings',
  }
  for (const [name, href] of Object.entries(hrefs)) {
    await expect(page.getByRole('link', { name: new RegExp(name) }).first()).toHaveAttribute('href', href)
  }
  for (const d of ['d1', 'd2', 'd3', 'd4', 'd5']) {
    await expect(page.locator(`a[href="#drill?domain=${d}"]`)).toHaveCount(1)
  }
})

test('question bank card count matches the Question Bank page', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  const card = await page.getByRole('link', { name: /Question Bank/ }).textContent()
  const homeCount = card!.match(/(\d+) questions/)![1]
  expect(Number(homeCount)).toBe(bank.questions.length)
  await page.goto('/#bank')
  await expect(page.getByText(new RegExp(`^${homeCount} total questions`))).toBeVisible()
})

test('the publish date is shown as stored on Home and the Bank page', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Question Bank/ })).toContainText(`published ${bank.published_at}.`)
  await page.goto('/#bank')
  await expect(page.getByText(`published ${bank.published_at}.`)).toBeVisible()
})

test('the app stays light even when the system prefers dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await withName(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Get started with a mode' })).toBeVisible()
  expect(await page.evaluate("document.documentElement.className")).toBe('')
  expect(await page.evaluate("getComputedStyle(document.querySelector('a[href=\"#exam\"]')).backgroundColor")).toBe('rgb(255, 255, 255)')
})

test('mock exam page loads from home', async ({ page }) => {
  await withName(page)
  await page.goto('/')
  await page.click('a[href="#exam"]')
  await expect(page.getByRole('heading', { level: 2, name: 'Mock exam' })).toBeVisible()
})

test('a domain card opens the drill with that domain selected', async ({ page }) => {
  const domains = JSON.parse(readFileSync(new URL('../../content/domains.json', import.meta.url), 'utf8'))
  const name = (id: string) => domains.find((d: { id: string }) => d.id === id).name
  await withName(page)
  await page.goto('/')
  await page.click('a[href="#drill?domain=d2"]')
  await expect(page.getByRole('heading', { name: 'Domain drill' })).toBeVisible()
  await expect(page.getByLabel(name('d2'), { exact: false })).toBeChecked()
  await expect(page.getByLabel(name('d1'), { exact: false })).not.toBeChecked()
})

test('drill page loads from home', async ({ page }) => {
  await page.goto('#drill')
  await expect(page.getByRole('heading', { name: 'Domain drill' })).toBeVisible()
})
