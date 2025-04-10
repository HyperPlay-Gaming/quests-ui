import { useGetExternalEligibility } from '@/hooks/useGetExternalEligibility'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { Quest } from '@hyperplay/utils'
import styles from './index.module.scss'
import cn from 'classnames'
import { getQuestRewardsClaimPeriod } from '@/helpers/rewards'
import { HTMLAttributes } from 'react'
export type LeaderboardBannerProps = HTMLAttributes<HTMLDivElement> & {
  quest: Quest
}

export function LeaderboardBanner({
  quest,
  className
}: LeaderboardBannerProps) {
  const { getExternalEligibility, isSignedIn } = useQuestWrapper()
  const { data: eligibilityData, isLoading } = useGetExternalEligibility({
    questId: quest.id,
    getExternalEligibility,
    enabled: isSignedIn
  })

  if (!quest.end_date || isLoading) {
    return null
  }

  const isQuestCompleted = quest.status === 'COMPLETED'

  if (!isQuestCompleted) {
    return null
  }

  const { isInWaitPeriod, isInClaimPeriod } = getQuestRewardsClaimPeriod(
    quest.end_date
  )

  if (isInWaitPeriod) {
    // blue state
    return (
      <div className={cn(styles.root, styles.finalizing, className)}>
        Thanks for participating! The game studio is finalizing results. You’ll
        be notified when you’re able to claim your reward here.*
      </div>
    )
  }

  if (isInClaimPeriod) {
    const isEligible = (eligibilityData?.amount ?? 0) > 0
    if (isEligible) {
      // green state
      return (
        <div className={cn(styles.root, styles.claimable, className)}>
          Thanks for participating! The game studio is finalizing results.
          You’ll be notified when you’re able to claim your reward here.*
        </div>
      )
    } else {
      // red state
      return (
        <div className={cn(styles.root, styles.notEligible, className)}>
          You didn’t qualify for a reward You didn't qualify this time, but
          HyperPlay has tons of quests to try—the next might be yours!
        </div>
      )
    }
  }

  return null
}
