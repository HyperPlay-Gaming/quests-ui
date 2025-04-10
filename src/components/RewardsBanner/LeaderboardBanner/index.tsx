import { useGetExternalEligibility } from '@/hooks/useGetExternalEligibility'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { Quest } from '@hyperplay/utils'
import styles from './index.module.scss'
import cn from 'classnames'
import { canClaimLeaderboardReward } from '@/helpers/rewards'
import { HTMLAttributes } from 'react'
import dayjs from 'dayjs'

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

  const shouldHideBanner = !quest.end_date || isLoading
  
  if (shouldHideBanner) {
    return null
  }

  const questEndDate = dayjs(quest.end_date)
  const questHasNotEndedYet = questEndDate.isAfter(dayjs())

  console.log('questHasNotEndedYet', questHasNotEndedYet)
  
  if (questHasNotEndedYet) {
    return null
  }

  const finalizingMessage = (
    <div className={cn(styles.root, styles.finalizing, className)}>
      Thanks for participating! The game studio is finalizing results. You'll be
      notified when you're able to claim your reward here.*
    </div>
  )

  const notEligibleMessage = (
    <div className={cn(styles.root, styles.notEligible, className)}>
      You didn't qualify for a reward. HyperPlay has tons of quests to try—the
      next might be yours!
    </div>
  )

  const claimableMessage = (
    <div className={cn(styles.root, styles.claimable, className)}>
      Thanks for participating! The game studio is finalizing results. You'll be
      notified when you're able to claim your reward here.*
    </div>
  )

  const isQuestClaimable = quest.status === 'CLAIMABLE'
  
  if (!isQuestClaimable) {
    return finalizingMessage
  }

  if (!eligibilityData) {
    return notEligibleMessage
  }

  const userCanClaimReward = canClaimLeaderboardReward(quest, eligibilityData)
  return userCanClaimReward ? claimableMessage : notEligibleMessage
}
