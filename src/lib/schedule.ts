import { z } from 'zod'

// Times are UTC and whole hours, because the refresh workflow runs once an hour.
export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
export const WEEKS_OF_MONTH = ['1st', '2nd', '3rd', '4th', 'last'] as const
export type Week = (typeof WEEKS_OF_MONTH)[number]

const time = z.string().regex(/^([01]\d|2[0-3]):00$/)
const weekday = z.enum(WEEKDAYS)

export const ScheduleSchema = z.discriminatedUnion('period', [
  z.object({ period: z.literal('weekly'), weekday, time }),
  z.object({ period: z.literal('monthly'), weekday, weekOfMonth: z.enum(WEEKS_OF_MONTH), time }),
])

export type Schedule = z.infer<typeof ScheduleSchema>

// Is this UTC hour a scheduled refresh? The hourly workflow matches the hour exactly.
export function isRefreshDue(schedule: Schedule, now: Date): boolean {
  if (now.getUTCHours() !== Number(schedule.time.slice(0, 2))) return false
  if (now.getUTCDay() !== WEEKDAYS.indexOf(schedule.weekday)) return false
  return schedule.period === 'weekly' || isWeekOfMonth(now, schedule.weekOfMonth)
}

// The 1st to 4th occurrence of a weekday falls on days 1-7, 8-14, 15-21 and 22-28.
// "last" means the weekday falls in the final seven days of the month.
function isWeekOfMonth(date: Date, week: Week): boolean {
  const day = date.getUTCDate()
  if (week === 'last') return day + 7 > daysInMonth(date)
  return Math.ceil(day / 7) === WEEKS_OF_MONTH.indexOf(week) + 1
}

function daysInMonth(date: Date): number {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
}

// The first scheduled hour after `from`, in UTC.
export function nextRunAt(schedule: Schedule, from: Date): Date {
  const next = new Date(from)
  next.setUTCMinutes(0, 0, 0)
  for (let hours = 1; hours <= 24 * 400; hours++) {
    next.setUTCHours(next.getUTCHours() + 1)
    if (isRefreshDue(schedule, next)) return next
  }
  throw new Error('No scheduled run within 400 days; check content/schedule.json')
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function describeSchedule(schedule: Schedule): string {
  const day = capitalize(schedule.weekday)
  if (schedule.period === 'weekly') return `Every ${day} at ${schedule.time} UTC`
  return `The ${schedule.weekOfMonth} ${day} of each month at ${schedule.time} UTC`
}
