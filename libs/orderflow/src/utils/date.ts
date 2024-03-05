import { INTERVALS } from '@tsquant/exchangeapi/dist/lib/constants/candles'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const createFormattedDate = (date: Date): string => {
  const dayOfMonth = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${dayOfMonth} ${month} ${year} ${hours}:${minutes}:${seconds}`
}

export const getStartOfMinute = (): Date => {
  const now = new Date()
  now.setSeconds(0, 0)
  return now
}

/**
 * Get the oldest date in an array of dates
 */
export function getOldestDate(arrayOfDates: Date[]): Date {
  return arrayOfDates.reduce((c, n) => (n < c ? n : c))
}

/**
 * Get the most recent data in an array of dates
 */
export function getNewestDate(arrayOfDates: Date[]): Date {
  return arrayOfDates.reduce((c, n) => (n > c ? n : c))
}

export function calculateStartDate(startAt: string) {
  // Convert the startAt string to a number and then to a Date object
  const timestamp = Number(startAt)
  const date = new Date(timestamp)

  date.setHours(0, 0, 0, 0) // Start of day at 00:00

  return date
}

export function adjustBackfillStartDate(processedTimestamps: { [interval: string]: { first: number; last: number } }, originalStartDate: Date) {
  const timestamps: number[] = Object.values(processedTimestamps)
    .map((ts) => ts.last)
    .filter((t) => t != null)

  let latestLast = originalStartDate.getTime()
  if (timestamps.length > 0) {
    const latestTimestamp = Math.max(...timestamps)
    latestLast = Math.max(latestTimestamp, latestLast)
  }

  // Find the difference in days and add it to originalStartDate
  const originalStartAtMidnight = new Date(originalStartDate)
  originalStartAtMidnight.setHours(0, 0, 0, 0) // Ensure we're starting at the beginning of the day

  const dayDifference = Math.floor((latestLast - originalStartAtMidnight.getTime()) / (24 * 60 * 60 * 1000))
  const adjustedStartDate = new Date(originalStartAtMidnight)
  adjustedStartDate.setDate(originalStartAtMidnight.getDate() + dayDifference)

  return adjustedStartDate
}

export function adjustBackfillEndDate(processedTimestamps: { [interval: string]: { first: number; last: number } }, originalEndDate: Date) {
  const timestamps: number[] = Object.values(processedTimestamps)
    .map((ts) => ts.first)
    .filter((t) => t != null)
  const earliestFirst: number = Math.max(...timestamps, originalEndDate.getTime())

  const earliestFirstDate: Date = new Date(earliestFirst)
  earliestFirstDate.setHours(0, 0, 0, 0)

  return earliestFirstDate
}

export const alignsWithTargetInterval = (targetInterval: INTERVALS, date: Date) => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const dayOfWeek = date.getDay() // Sunday - 0, Monday - 1, ..., Saturday - 6
  const dayOfMonth = date.getDate()

  switch (targetInterval) {
    case INTERVALS.FIVE_MINUTES:
      return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].includes(minutes)
    case INTERVALS.FIFTEEN_MINUTES:
      return [0, 15, 30, 45].includes(minutes)
    case INTERVALS.THIRTY_MINUTES:
      return [0, 30].includes(minutes)
    case INTERVALS.ONE_HOUR:
      return minutes === 0
    case INTERVALS.TWO_HOURS:
      return minutes === 0 && [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].includes(hours)
    case INTERVALS.FOUR_HOURS:
      return minutes === 0 && [0, 4, 8, 12, 16, 20].includes(hours)
    case INTERVALS.EIGHT_HOURS:
      return minutes === 0 && [0, 8, 16].includes(hours)
    case INTERVALS.TWELVE_HOURS:
      return minutes === 0 && (hours === 0 || hours === 12)
    case INTERVALS.ONE_DAY:
      return hours === 0 && minutes === 0
    case INTERVALS.ONE_WEEK:
      // Assuming the start of the week is Sunday
      return dayOfWeek === 0 && hours === 0 && minutes === 0
    case INTERVALS.ONE_MONTH:
      // Assuming the start of the month is the first day
      return dayOfMonth === 1 && hours === 0 && minutes === 0
    default:
      return false
  }
}
