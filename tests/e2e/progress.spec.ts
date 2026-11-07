import { expect, test, type Page } from '@playwright/test'

const visibleOption = (page: Page) => page.locator('fieldset:visible input').first()
const condition = (page: Page, label: RegExp) => page.getByRole('listitem').filter({ hasText: label })

async function finishD1Drill(page: Page) {
  await page.goto('/')
  await page.getByLabel(/Agentic Architecture & Orchestration/).check()
  await page.getByLabel(/Show the explanation right after each answer/).uncheck()
  await page.getByRole('button', { name: 'Start drill' }).click()
  while (await page.getByRole('button', { name: 'Submit answer' }).isVisible()) {
    await visibleOption(page).check()
    await page.getByRole('button', { name: 'Submit answer' }).click()
  }
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
}

test('a finished drill appears on the progress page, with concepts to revisit', async ({ page }) => {
  await finishD1Drill(page)
  await page.getByRole('link', { name: 'Progress' }).click()
  await expect(page.getByText('1 drill completed.')).toBeVisible()
  const concepts = page.getByRole('region', { name: 'Concepts to revisit' })
  await expect(concepts.getByRole('link').first()).toHaveAttribute('href', /^#wt-d1-/)
  await expect(page.getByText(/An estimate, not a guarantee/)).toBeVisible()
})

test('a short mock exam is recorded but does not count toward readiness', async ({ page }) => {
  await page.goto('/#exam')
  await page.getByRole('button', { name: 'Start exam' }).click()
  await page.getByRole('button', { name: 'Submit exam' }).click()
  await page.getByRole('button', { name: 'Confirm submit' }).click()
  await page.getByRole('link', { name: 'Progress' }).click()
  await expect(page.getByText('short exam')).toBeVisible()
  await expect(condition(page, /full mock exams/)).toContainText('0 of 3 completed')
  await expect(page.getByText('Not ready yet')).toBeVisible()
})

test('lab checks and walkthrough visits persist across reloads', async ({ page }) => {
  await page.goto('/#lab-d1')
  await page.getByLabel(/I ran npm run check/).check()
  await page.goto('/#walkthrough-d2')
  await expect(page.getByRole('heading', { level: 2, name: 'Tool Design & MCP Integration' })).toBeVisible()

  await page.reload()
  await page.goto('/#progress')
  await expect(condition(page, /Complete every lab/)).not.toContainText('Agentic Architecture & Orchestration')
  await expect(condition(page, /Complete every lab/)).toContainText('Tool Design & MCP Integration')
  await expect(condition(page, /Read every walkthrough/)).not.toContainText('Tool Design & MCP Integration')

  await page.goto('/#lab-d1')
  await expect(page.getByLabel(/I ran npm run check/)).toBeChecked()
})

test('reset deletes all progress after confirmation', async ({ page }) => {
  await finishD1Drill(page)
  await page.goto('/#progress')
  await page.getByRole('button', { name: 'Reset all progress' }).click()
  await page.getByRole('button', { name: 'Keep it' }).click()
  await expect(page.getByText('1 drill completed.')).toBeVisible()

  await page.getByRole('button', { name: 'Reset all progress' }).click()
  await page.getByRole('button', { name: 'Delete my progress' }).click()
  await expect(page.getByText('0 drills completed.')).toBeVisible()
  await page.reload()
  await expect(page.getByText('0 drills completed.')).toBeVisible()
})
