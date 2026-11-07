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
  // Every domain now fills a full exam, so seed a short one directly in storage.
  await page.addInitScript(() => {
    localStorage.setItem('cca-progress-v1', JSON.stringify({
      attempts: [{
        id: 'exam-short',
        mode: 'exam',
        started_at: '2026-11-07T10:00:00.000Z',
        finished_at: '2026-11-07T10:20:00.000Z',
        question_ids: ['d1-001'],
        responses: { 'd1-001': ['B'] },
        score_by_domain: { d1: { correct: 1, total: 1 } },
        full: false,
      }],
      labsCompleted: {},
      walkthroughsSeen: {},
    }))
  })
  await page.goto('/#progress')
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

test('the progress page shows the question bank version and publish date', async ({ page }) => {
  await page.goto('/#progress')
  await expect(page.getByText(/Question bank version 1, published 2026-11-07, 150 questions/)).toBeVisible()
})
