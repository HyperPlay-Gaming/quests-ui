import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(utc)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const WAIT_PERIOD_IN_DAYS = 7

export function getQuestRewardsClaimPeriod(endDate: string) {
  const today = dayjs().utc()
  const waitPeriod = dayjs(endDate).utc().add(WAIT_PERIOD_IN_DAYS, 'days')
  const claimPeriod = dayjs(endDate)
    .utc()
    .add(WAIT_PERIOD_IN_DAYS + 1, 'days')

  const isInWaitPeriod = today.isSameOrBefore(waitPeriod)
  const isInClaimPeriod =
    today.isSameOrAfter(waitPeriod) && today.isSameOrBefore(claimPeriod)

  return {
    isInWaitPeriod,
    isInClaimPeriod
  }
}
