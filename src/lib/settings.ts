import { z } from 'zod'

export type RefreshPeriod = 'weekly' | 'monthly'

const SettingsSchema = z.object({
  refreshPeriod: z.enum(['weekly', 'monthly']),
  scheduleTime: z.string().regex(/^\d{2}:\d{2}$/),
  lastRefreshAt: z.string().nullable(),
})

export type Settings = z.infer<typeof SettingsSchema>

export const emptySettings = (): Settings => ({
  refreshPeriod: 'weekly',
  scheduleTime: '09:00',
  lastRefreshAt: null,
})

export type SettingsRepository = { load(): Settings; save(settings: Settings): void }

const KEY = 'cca-settings-v1'

type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void }

// Mirror of the progress repository: localStorage today, validates stored data and starts fresh if
// it's corrupt or unavailable, so settings last for this visit only when site data is blocked.
export function localStorageSettingsRepository(custom?: StorageLike): SettingsRepository {
  const storage = () => custom ?? (globalThis as unknown as { localStorage: StorageLike }).localStorage
  return {
    load() {
      try {
        const parsed = SettingsSchema.safeParse(JSON.parse(storage().getItem(KEY) ?? 'null'))
        return parsed.success ? parsed.data : emptySettings()
      } catch {
        return emptySettings()
      }
    },
    save(settings) {
      try {
        storage().setItem(KEY, JSON.stringify(settings))
      } catch {
        // Storage can be full or blocked (private mode). Settings last for this visit only.
      }
    },
  }
}
