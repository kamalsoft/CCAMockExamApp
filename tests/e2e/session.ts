import type { Page } from '@playwright/test'

// Home shows its navigation only after a name is entered. Tests that start there save one first.
export const withName = (page: Page) => page.addInitScript(() => sessionStorage.setItem('cca-user-v1', 'Tester'))
