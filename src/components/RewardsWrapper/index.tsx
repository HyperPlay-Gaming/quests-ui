import { Fragment } from 'react'
import { useGetQuest } from '@/hooks/useGetQuest'
import { useGetRewards } from '@/hooks/useGetRewards'
import { useGetUserPlayStreak } from '@/hooks/useGetUserPlayStreak'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { RewardsRow, Rewards, LoadingSpinner } from '@hyperplay/ui'
import { RewardWrapper } from '../RewardWrapper'
import styles from './index.module.scss'
export function RewardsWrapper({ questId }: { questId: number | null }) {
  const { getQuest, logError, getUserPlayStreak, getExternalTaskCredits, questSSR } =
    useQuestWrapper()

  const { data: questQuery } = useGetQuest(questId, getQuest, !!questSSR)

  const {
    data: questPlayStreakQuery,
    invalidateQuery: invalidateQuestPlayStreakQuery
  } = useGetUserPlayStreak(questId, getUserPlayStreak)

  const { data: rewardsQuery } = useGetRewards({
    questId,
    getQuest,
    getExternalTaskCredits,
    logError,
    questSSR
  })

  if (rewardsQuery.isLoading) {
    return (
      <Rewards>
        <LoadingSpinner className={styles.loadingSpinner} />
      </Rewards>
    )
  }

  const questMeta = questSSR ?? questQuery?.data
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
              questPlayStreakData={questPlayStreakData?.userPlayStreak}
              invalidateQuestPlayStreakQuery={invalidateQuestPlayStreakQuery}
            />
          ))}
        </RewardsRow>
      </Fragment>
    )
  )

  return <Rewards>{rewardsContent}</Rewards>
}
