import { Fragment } from 'react'
import useGetQuest from '@/hooks/useGetQuest'
import { useGetRewards } from '@/hooks/useGetRewards'
import useGetUserPlayStreak from '@/hooks/useGetUserPlayStreak'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { RewardsRow, Rewards } from '@hyperplay/ui'
import { RewardWrapper } from '../RewardWrapper'
import { UseGetRewardsData } from '@/types/quests'

export function RewardsWrapper({ questId }: { questId: number | null }) {
  const { getQuest, logError, getUserPlayStreak, getExternalTaskCredits } =
    useQuestWrapper()

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

  const questMeta = questQuery?.data
  const questPlayStreakData = questPlayStreakQuery?.data
  const rewardsData = rewardsQuery?.data

  if (!rewardsData || !questMeta) {
    return null
  }

  // console.log(rewardsData)

  // Organize rewards by category
  const rewardsByCategory: Record<string, UseGetRewardsData[]> = {}

  for (const reward_i of rewardsData) {
    if (Object.hasOwn(rewardsByCategory, reward_i.chainName)) {
      rewardsByCategory[reward_i.chainName].push(reward_i)
    } else {
      rewardsByCategory[reward_i.chainName] = [reward_i]
    }
  }

  const rewardsContent = Object.keys(rewardsByCategory).map(
    (rewardCategory) => (
      <Fragment key={rewardCategory}>
        <RewardsRow category={rewardCategory} key={rewardCategory}>
          {rewardsByCategory[rewardCategory].map((reward) => (
            <RewardWrapper
              key={reward.id}
              reward={reward}
              questId={questId}
              questMeta={questMeta}
              questPlayStreakData={questPlayStreakData}
              invalidateQuestPlayStreakQuery={invalidateQuestPlayStreakQuery}
            />
          ))}
        </RewardsRow>
      </Fragment>
    )
  )

  return <Rewards>{rewardsContent}</Rewards>
}
