import { expect, test, type Page } from '@playwright/test'

async function startHardD1Drill(page: Page, explainImmediately: boolean) {
  await page.goto('#drill')
  await page.getByLabel(/Agentic Architecture & Orchestration/).check()
  await page.getByLabel('Difficulty').selectOption('hard')
  const explain = page.getByLabel(/Show the explanation right after each answer/)
  if (!explainImmediately) await explain.uncheck()
  await expect(page.getByText(/^\d+ questions? match/)).toBeVisible()
  const total = Number((await page.getByText(/questions? match/).textContent())!.split(' ')[0])
  await page.getByRole('button', { name: 'Start drill' }).click()
  return total
}

test('drill with explanations after each answer', async ({ page }) => {
  const total = await startHardD1Drill(page, true)
  expect(total).toBeGreaterThan(0)

  for (let i = 1; i <= total; i++) {
    await expect(page.getByText(`Question ${i} of ${total}`)).toBeVisible()
    await page.locator('fieldset input').first().check()
    await page.getByRole('button', { name: 'Submit answer' }).click()
    await expect(page.getByRole('status')).toContainText(/Correct:/)
    await page.getByRole('button', { name: 'Next' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.getByText(new RegExp(`of ${total} correct`))).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Agentic Architecture & Orchestration' })).toBeVisible()
})

test('drill with explanations at the end', async ({ page }) => {
  const total = await startHardD1Drill(page, false)

  for (let i = 1; i <= total; i++) {
    await page.locator('fieldset input').first().check()
    await page.getByRole('button', { name: 'Submit answer' }).click()
    await expect(page.getByRole('status')).toHaveCount(0)
  }

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.getByText(/Correct:/)).toHaveCount(total)
  await page.getByRole('button', { name: 'New drill' }).click()
  await expect(page.getByRole('heading', { name: 'Domain drill' })).toBeVisible()
})

test('start is disabled until a domain is chosen', async ({ page }) => {
  await page.goto('#drill')
  await expect(page.getByText('0 questions match')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start drill' })).toBeDisabled()
})

test('focus moves to each new question in a drill', async ({ page }) => {
  await startHardD1Drill(page, true)
  await expect(page.locator(':focus')).toHaveAttribute('tabindex', '-1')

  await page.locator('fieldset input').first().check()
  await page.getByRole('button', { name: 'Submit answer' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText(/^Question 2 of/)).toBeVisible()
  await expect(page.locator(':focus')).toHaveAttribute('tabindex', '-1')
})

test('pause a drill, reload, and resume where it left off', async ({ page }) => {
  await page.goto('#drill')
  await page.getByLabel(/Agentic Architecture & Orchestration/).check()
  await page.getByLabel(/Show the explanation right after each answer/).uncheck()
  await page.getByRole('button', { name: 'Start drill' }).click()

  await page.locator('fieldset input').first().check()
  await page.getByRole('button', { name: 'Submit answer' }).click()
  await expect(page.getByText(/^Question 2 of/)).toBeVisible()
  await page.getByRole('button', { name: 'Pause drill' }).click()

  await page.reload()
  await expect(page.getByText(/You have a paused drill: 1 of \d+ answered/)).toBeVisible()
  await page.getByRole('button', { name: 'Resume drill' }).click()
  await expect(page.getByText(/^Question 2 of/)).toBeVisible()
})

test('discarding a paused drill removes it', async ({ page }) => {
  await page.goto('#drill')
  await page.getByLabel(/Agentic Architecture & Orchestration/).check()
  await page.getByRole('button', { name: 'Start drill' }).click()
  await page.getByRole('button', { name: 'Pause drill' }).click()

  await expect(page.getByText(/You have a paused drill/)).toBeVisible()
  await page.getByRole('button', { name: 'Discard paused drill' }).click()
  await expect(page.getByText(/You have a paused drill/)).toHaveCount(0)
})

test('a paused drill with a question no longer in the bank says so', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cca-progress-v1', JSON.stringify({
      attempts: [], labsCompleted: {}, walkthroughsSeen: {},
      drill: { questionIds: ['d1-999'], responses: {}, startedAt: 1, explainImmediately: true },
    }))
  })
  await page.goto('#drill')
  await page.getByRole('button', { name: 'Resume drill' }).click()
  await expect(page.getByText(/no longer in the bank, so it was discarded/)).toBeVisible()
})
