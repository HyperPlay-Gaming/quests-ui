import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { getQuestRewardsClaimPeriod } from './getQuestRewardsClaimPeriod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

describe('getQuestRewardsClaimPeriod', () => {
  const FIXED_DATE = '2024-03-20T12:00:00Z'

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FIXED_DATE))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should be in wait period when current date is before wait period end', () => {
    const endDate = dayjs(FIXED_DATE).subtract(1, 'day').utc().format()
    const result = getQuestRewardsClaimPeriod(endDate)
    expect(result.isInWaitPeriod).toBe(true)
    expect(result.isInClaimPeriod).toBe(false)
  })

  test('should be in claim period when current date is after wait period but before claim period end', () => {
    const endDate = dayjs(FIXED_DATE).subtract(8, 'day').utc().format()
    const result = getQuestRewardsClaimPeriod(endDate)
    expect(result.isInWaitPeriod).toBe(false)
    expect(result.isInClaimPeriod).toBe(true)
  })

  test('should not be in any period when current date is after claim period', () => {
    const endDate = dayjs(FIXED_DATE).subtract(9, 'day').utc().format()
    const result = getQuestRewardsClaimPeriod(endDate)
    expect(result.isInWaitPeriod).toBe(false)
    expect(result.isInClaimPeriod).toBe(false)
  })
})
