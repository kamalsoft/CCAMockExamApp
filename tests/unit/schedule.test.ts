import { describe, expect, it } from 'vitest'
import { isRefreshDue, nextRunAt, ScheduleSchema, type Schedule } from '../../src/lib/schedule.ts'

const weekly: Schedule = { period: 'weekly', weekday: 'monday', time: '09:00' }
const secondMonday: Schedule = { period: 'monthly', weekday: 'monday', weekOfMonth: '2nd', time: '09:00' }
const lastFriday: Schedule = { period: 'monthly', weekday: 'friday', weekOfMonth: 'last', time: '09:00' }

describe('isRefreshDue', () => {
  it.each([
    ['weekly on the day and hour', weekly, '2026-11-09T09:00:00Z', true],
    ['weekly, another hour', weekly, '2026-11-09T10:00:00Z', false],
    ['weekly, another day', weekly, '2026-11-10T09:00:00Z', false],
    ['second Monday', secondMonday, '2026-11-09T09:00:00Z', true],
    ['third Monday is not the second', secondMonday, '2026-11-16T09:00:00Z', false],
    ['last Friday of the month', lastFriday, '2026-11-27T09:00:00Z', true],
    ['a Friday that is not the last', lastFriday, '2026-11-20T09:00:00Z', false],
  ])('%s', (_name, schedule, iso, due) => {
    expect(isRefreshDue(schedule, new Date(iso))).toBe(due)
  })
})

describe('nextRunAt', () => {
  it('finds the next weekly hour after now', () => {
    expect(nextRunAt(weekly, new Date('2026-11-08T10:00:00Z')).toISOString()).toBe('2026-11-09T09:00:00.000Z')
  })

  it('finds the last Friday of the following month', () => {
    expect(nextRunAt(lastFriday, new Date('2026-11-27T10:00:00Z')).toISOString()).toBe('2026-12-25T09:00:00.000Z')
  })
})

describe('ScheduleSchema', () => {
  it('accepts whole UTC hours only', () => {
    expect(ScheduleSchema.safeParse({ period: 'weekly', weekday: 'monday', time: '09:00' }).success).toBe(true)
    expect(ScheduleSchema.safeParse({ period: 'weekly', weekday: 'monday', time: '09:30' }).success).toBe(false)
    expect(ScheduleSchema.safeParse({ period: 'weekly', weekday: 'monday', time: '24:00' }).success).toBe(false)
  })

  it('requires a week of the month for monthly schedules', () => {
    expect(ScheduleSchema.safeParse({ period: 'monthly', weekday: 'monday', time: '09:00' }).success).toBe(false)
  })
})
