import { useGetExternalEligibility } from '@/hooks/useGetExternalEligibility'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { Quest } from '@hyperplay/utils'
import styles from './index.module.scss'
import cn from 'classnames'
import { canClaimLeaderboardReward } from '@/helpers/rewards'
import { HTMLAttributes } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle
} from '@tabler/icons-react'

export type LeaderboardBannerProps = HTMLAttributes<HTMLDivElement> & {
  quest: Quest
}

export function LeaderboardBanner({
  quest,
  className
}: LeaderboardBannerProps) {
  const { tOverride } = useQuestWrapper()
  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

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

  if (questHasNotEndedYet) {
    return null
  }

  const finalizingMessage = (
    <div className={cn(styles.root, styles.finalizing, className)}>
      <IconInfoCircle
        className={styles.finalizingIcon}
        width={24}
        height={24}
      />
      <div className={styles.textContainer}>
        <span className="eyebrow weight--bold">
          {t(
            'quest.rewards.leaderboardBanner.finalizing.title',
            "Thanks for participating! The game studio is finalizing results. You'll be notified when you're able to claim your reward here.*"
          )}
        </span>
        <span className="caption-sm">
          {t(
            'quest.rewards.leaderboardBanner.finalizing.disclaimer',
            '*Note: Eligibility is verified by the game studio, not HyperPlay.'
          )}
        </span>
      </div>
    </div>
  )

  const notEligibleMessage = (
    <div className={cn(styles.root, styles.notEligible, className)}>
      <IconAlertTriangle
        className={styles.notEligibleIcon}
        width={24}
        height={24}
      />
      <div className={styles.textContainer}>
        <span className="eyebrow weight--bold">
          {t(
            'quest.rewards.leaderboardBanner.notEligible.title',
            "You didn't qualify for a reward"
          )}
        </span>
        <span className="caption-sm">
          {t(
            'quest.rewards.leaderboardBanner.notEligible.disclaimer',
            "You didn't qualify this time, but HyperPlay has tons of quests to try—the next might be yours!"
          )}
        </span>
      </div>
    </div>
  )

  const claimableMessage = (
    <div className={cn(styles.root, styles.claimable, className)}>
      <IconCircleCheck
        className={styles.claimableIcon}
        width={24}
        height={24}
      />
      <div className={styles.textContainer}>
        <span className="eyebrow weight--bold">
          {t(
            'quest.rewards.leaderboardBanner.claimable.title',
            'You qualified for a Reward! The game studio has finalized results and you’re eligible—claim your reward below.*'
          )}
        </span>
        <span className="caption-sm">
          {t(
            'quest.rewards.leaderboardBanner.claimable.disclaimer',
            '*Note: Eligibility is verified by the game studio, not HyperPlay.'
          )}
        </span>
      </div>
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
