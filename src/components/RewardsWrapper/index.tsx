import { Fragment } from 'react'
import { useGetQuest } from '@/hooks/useGetQuest'
import { useGetRewards } from '@/hooks/useGetRewards'
import { useGetUserPlayStreak } from '@/hooks/useGetUserPlayStreak'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { RewardsRow, Rewards, LoadingSpinner } from '@hyperplay/ui'
import { RewardWrapper } from '../RewardWrapper'
import styles from './index.module.scss'
import RewardsBanner from '../RewardsBanner'
import { useGetExternalEligibility } from '@/hooks/useGetExternalEligibility'

export function RewardsWrapper({
  questId,
  hideClaim
}: {
  questId: number | null
  hideClaim?: boolean
}) {
  const {
    isSignedIn,
    getQuest,
    logError,
    getUserPlayStreak,
    getExternalTaskCredits,
    getExternalEligibility
  } = useQuestWrapper()

  const { data: questQuery } = useGetQuest(questId, getQuest)

  const {
    data: questPlayStreakQuery,
    invalidateQuery: invalidateQuestPlayStreakQuery
  } = useGetUserPlayStreak(questId, getUserPlayStreak)

  const { data: rewardsQuery } = useGetRewards({
    questId,
    getQuest,
    getExternalTaskCredits,
    logError
  })

  const { data: externalEligibilityQuery } = useGetExternalEligibility({
    questId,
    getExternalEligibility,
    enabled: isSignedIn && questId !== null
  })

  if (rewardsQuery.isLoading) {
    return (
      <Rewards>
        <LoadingSpinner
          className={styles.loadingSpinner}
          aria-label="loading rewards"
        />
      </Rewards>
    )
  }

  const questMeta = questQuery?.data
  const questPlayStreakData = questPlayStreakQuery?.data
  const rewardsData = rewardsQuery?.data

  if (!rewardsData || !questMeta) {
    return null
  }

  const rewardsContent = Object.keys(rewardsData.rewardsByCategory).map(
    (rewardCategory) => (
      <Fragment key={rewardCategory}>
        <RewardsRow category={rewardCategory} key={rewardCategory}>
          {rewardsData.rewardsByCategory[rewardCategory].map((reward) => (
            <RewardWrapper
              key={reward.id}
              reward={reward}
              questId={questId}
              questMeta={questMeta}
              externalEligibility={externalEligibilityQuery}
              questPlayStreakData={questPlayStreakData?.userPlayStreak}
              invalidateQuestPlayStreakQuery={invalidateQuestPlayStreakQuery}
              hideClaim={hideClaim}
            />
          ))}
        </RewardsRow>
      </Fragment>
    )
  )

  return (
    <Rewards>
      <RewardsBanner quest={questMeta} className={styles.banner} />
      {rewardsContent}
    </Rewards>
  )
}
