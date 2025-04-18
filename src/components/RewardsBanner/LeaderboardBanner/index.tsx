import { useGetExternalEligibility } from '@/hooks/useGetExternalEligibility'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { Quest } from '@hyperplay/utils'
import styles from './index.module.scss'
import cn from 'classnames'
import { canClaimLeaderboardReward } from '@/helpers/canClaimReward'
import { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle
} from '@tabler/icons-react'
import { RewardBanner } from '@/components/RewardBanner'

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
  const {
    data: eligibilityData,
    isLoading,
    isError
  } = useGetExternalEligibility({
    questId: quest.id,
    getExternalEligibility,
    enabled: isSignedIn
  })

  const shouldHideBanner = isLoading || isError

  if (shouldHideBanner) {
    return null
  }

  const finalizingMessage = (
    <RewardBanner
      className={cn(styles.finalizing, className)}
      icon={
        <IconInfoCircle
          width={24}
          height={24}
          className={styles.finalizingIcon}
        />
      }
      title={t(
        'quest.rewards.leaderboardBanner.finalizing.title',
        "Thanks for participating! The game studio is finalizing results. You'll be notified when you're able to claim your reward here.*"
      )}
      disclaimer={t(
        'quest.rewards.leaderboardBanner.finalizing.disclaimer',
        '*Note: Eligibility is verified by the game studio, not HyperPlay.'
      )}
    />
  )

  const notEligibleMessage = (
    <RewardBanner
      className={cn(styles.notEligible, className)}
      icon={
        <IconAlertTriangle
          width={24}
          height={24}
          className={styles.notEligibleIcon}
        />
      }
      title={t(
        'quest.rewards.leaderboardBanner.notEligible.title',
        "You didn't qualify for a reward"
      )}
      disclaimer={t(
        'quest.rewards.leaderboardBanner.notEligible.disclaimer',
        "You didn't qualify this time, but HyperPlay has tons of quests to try—the next might be yours!"
      )}
    />
  )

  const claimableMessage = (
    <RewardBanner
      className={cn(styles.claimable, className)}
      icon={
        <IconCircleCheck
          width={24}
          height={24}
          className={styles.claimableIcon}
        />
      }
      title={t(
        'quest.rewards.leaderboardBanner.claimable.title',
        "You qualified for a Reward! The game studio has finalized results and you're eligible—claim your reward below.*"
      )}
      disclaimer={t(
        'quest.rewards.leaderboardBanner.claimable.disclaimer',
        '*Note: Eligibility is verified by the game studio, not HyperPlay.'
      )}
    />
  )

  if (quest.status === 'COMPLETED') {
    return finalizingMessage
  }

  if (quest.status === 'CLAIMABLE') {
    if (!eligibilityData?.externalEligibility) {
      return notEligibleMessage
    }
    const userCanClaimReward = canClaimLeaderboardReward(
      quest,
      eligibilityData.externalEligibility
    )
    return userCanClaimReward ? claimableMessage : notEligibleMessage
  }
  
  return null
}
