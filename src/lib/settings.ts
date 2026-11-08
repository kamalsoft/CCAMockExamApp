import { z } from 'zod'

export type RefreshPeriod = 'weekly' | 'monthly'

const DayOfWeekEnum = z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
const DayOfMonthEnum = z.enum([
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15',
  '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
])
const WeekEnum = z.enum(['1st', '2nd', '3rd', '4th', 'last'])

export const SettingsSchema = z.object({
  refreshPeriod: z.enum(['weekly', 'monthly']),
  scheduleTime: z.string().regex(/^\d{2}:\d{2}$/),
  dayOfWeek: DayOfWeekEnum,        // For weekly: which day to run
  dayOfMonth: DayOfMonthEnum,      // For monthly: which day to run
  weekOfMonth: WeekEnum,           // For monthly: which occurrence (1st, 2nd, last)
  lastRefreshAt: z.string().nullable(),
})

export type DayOfWeek = z.infer<typeof DayOfWeekEnum>
export type DayOfMonth = z.infer<typeof DayOfMonthEnum>
export type Week = z.infer<typeof WeekEnum>

export type Settings = z.infer<typeof SettingsSchema>

export const emptySettings = (): Settings => ({
  refreshPeriod: 'weekly',
  scheduleTime: '09:00',
  dayOfWeek: 'monday',
  dayOfMonth: '1',
  weekOfMonth: '1st',
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
