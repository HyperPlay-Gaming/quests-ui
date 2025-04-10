import dayjs from 'dayjs'

const WAIT_PERIOD_IN_DAYS = 7

export function getQuestRewardsPeriod(endDate: string) {
  const today = dayjs()
  const waitPeriod = dayjs(endDate).add(WAIT_PERIOD_IN_DAYS, 'days')
  const claimPeriod = dayjs(endDate)
    .add(WAIT_PERIOD_IN_DAYS, 'days')
    .add(1, 'days')
  return {
    isInWaitPeriod: today.isBefore(waitPeriod),
    isInClaimPeriod: today.isAfter(waitPeriod) && today.isBefore(claimPeriod)
  }
}
