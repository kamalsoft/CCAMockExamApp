import { describe, expect, it } from 'vitest'
import { emptySettings, localStorageSettingsRepository } from '../../src/lib/settings.ts'

const memoryStorage = (initial?: string) => {
  const data = new Map<string, string>(initial === undefined ? [] : [['cca-settings-v1', initial]])
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) }
}

describe('localStorageSettingsRepository', () => {
  it('round-trips settings', () => {
    const repo = localStorageSettingsRepository(memoryStorage())
    repo.save({ refreshPeriod: 'monthly', scheduleTime: '21:30', dayOfWeek: 'friday', dayOfMonth: '15', weekOfMonth: '2nd', lastRefreshAt: '2026-11-08T09:00:00.000Z' })
    expect(repo.load()).toEqual({
      refreshPeriod: 'monthly',
      scheduleTime: '21:30',
      dayOfWeek: 'friday',
      dayOfMonth: '15',
      weekOfMonth: '2nd',
      lastRefreshAt: '2026-11-08T09:00:00.000Z',
    })
  })

  it('starts fresh when stored data is missing, corrupt, or the wrong shape', () => {
    for (const stored of [undefined, '{not json', '{"refreshPeriod": "nope"}']) {
      expect(localStorageSettingsRepository(memoryStorage(stored)).load()).toEqual(emptySettings())
    }
  })

  it('does not throw when storage refuses to save', () => {
    const full = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError') } }
    expect(() => localStorageSettingsRepository(full).save(emptySettings())).not.toThrow()
  })
})
