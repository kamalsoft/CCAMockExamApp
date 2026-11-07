import { expect, test, type Page } from '@playwright/test'

const visibleOption = (page: Page) => page.locator('fieldset:visible input').first()

async function startExam(page: Page) {
  await page.getByRole('link', { name: 'Mock exam' }).click()
  await page.getByRole('button', { name: 'Start exam' }).click()
  return Number((await page.getByText(/^Question 1 of \d+/).textContent())!.match(/of (\d+)/)![1])
}

test('intro offers a full 60-question exam now that every domain is filled', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Mock exam' }).click()
  await expect(page.getByText(/60 questions · 120 minutes/)).toBeVisible()
  await expect(page.getByRole('note')).toHaveCount(0)
})

test('take an exam: answer, flag, navigate, switch modes, and submit', async ({ page }) => {
  await page.goto('/')
  const total = await startExam(page)
  await expect(page.getByRole('timer')).toHaveText(/^(2:00:00|1:59:\d\d)$/)

  await visibleOption(page).check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Flag for review' }).click()
  await expect(page.getByRole('button', { name: 'Question 1, answered' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Question 2, flagged' })).toBeVisible()

  // Switching to the drill and back keeps the running exam.
  await page.getByRole('link', { name: 'Domain drill' }).click()
  await page.getByRole('link', { name: 'Mock exam' }).click()
  await page.getByRole('button', { name: 'Question 1, answered' }).click()
  await expect(page.getByText(`Question 1 of ${total}`)).toBeVisible()
  await expect(visibleOption(page)).toBeChecked()

  // No explanations before submitting.
  await expect(page.getByText(/^Correct:/)).toHaveCount(0)

  await page.getByRole('button', { name: 'Submit exam' }).click()
  await expect(page.getByRole('alertdialog')).toContainText(`You have ${total - 1} unanswered questions`)
  await expect(page.getByRole('alertdialog')).toContainText('1 flagged for review')
  await page.getByRole('button', { name: 'Confirm submit' }).click()

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.getByText(new RegExp(`of ${total} correct`))).toBeVisible()
  await expect(page.getByText(`${total - 1} unanswered (counted as incorrect)`)).toBeVisible()
  await expect(page.getByText(/Correct:/)).toHaveCount(total)
})

test('exam submits itself when time runs out', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await startExam(page)
  await visibleOption(page).check()

  await page.clock.fastForward('02:00:01')

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.getByText(/Time ran out, so the exam was submitted automatically/)).toBeVisible()
})

test('focus moves into the exam on start and to "Keep working" when the submit dialog opens', async ({ page }) => {
  await page.goto('/')
  await startExam(page)
  await expect(page.locator(':focus')).toHaveAttribute('tabindex', '-1')

  await page.getByRole('button', { name: 'Submit exam' }).click()
  await expect(page.getByRole('button', { name: 'Keep working' })).toBeFocused()
})
