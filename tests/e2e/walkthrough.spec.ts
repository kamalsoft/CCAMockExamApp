import { expect, test } from '@playwright/test'

test('browse to the d1 walkthrough and on to its lab', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Walkthroughs' }).click()
  // Every domain has a walkthrough now, so the index lists five links and nothing "coming soon".
  await expect(page.getByRole('main').getByRole('listitem').getByRole('link')).toHaveCount(5)
  await expect(page.getByText(/coming soon/)).toHaveCount(0)

  await page.getByRole('link', { name: 'Agentic Architecture & Orchestration' }).click()
  await expect(page).toHaveURL(/#walkthrough-d1$/)
  await expect(page.getByRole('heading', { level: 2, name: 'Agentic Architecture & Orchestration' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Hooks' })).toContainText('PreToolUse')
  await expect(page.getByRole('region', { name: 'Checklist: what to do without notes' })).toBeVisible()

  await page.getByRole('link', { name: 'Open the Domain 1 lab' }).click()
  await expect(page).toHaveURL(/#lab-d1$/)
  await expect(page.getByRole('heading', { name: 'Lab: Build an agent loop with a prerequisite gate' })).toBeVisible()
  // Lab page shows numbered steps with implementation guidance
  await expect(page.getByRole('heading', { name: 'Step 1: Set up the agent loop' })).toBeVisible()
  // Completion checkbox is present for self-reporting (the one from Lab.tsx, not the step checkboxes)
  await expect(page.getByRole('checkbox', { name: /I ran npm run check/ })).toBeVisible()
})

test('a concept link in an explanation opens its walkthrough section, and back returns to the drill', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel(/Agentic Architecture & Orchestration/).check()
  await page.getByRole('button', { name: 'Start drill' }).click()
  await page.locator('fieldset:visible input').first().check()
  await page.getByRole('button', { name: 'Submit answer' }).click()

  const concept = page.getByRole('status').getByRole('link').first()
  await concept.click()
  await expect(page).toHaveURL(/#wt-d1-[a-z-]+$/)
  const anchor = new URL(page.url()).hash.slice(1)
  await expect(page.locator(`[id="${anchor}"]`)).toBeInViewport()

  await page.goBack()
  await expect(page.getByText(/^Question 1 of \d+/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
})
