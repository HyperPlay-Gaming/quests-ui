import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useGetQuest } from './useGetQuest'
import { getDecimalNumberFromAmount, Quest } from '@hyperplay/utils'
import { getRewardCategory } from '../helpers/getRewardCategory'
import { useTranslation } from 'react-i18next'
import { QuestWrapperContextValue, UseGetRewardsData } from '@/types/quests'

export function useGetRewards({
  questId,
  getQuest,
  getExternalTaskCredits,
  logError,
  questSSR
}: {
  questId: number | null
  getQuest: QuestWrapperContextValue['getQuest']
  getExternalTaskCredits: QuestWrapperContextValue['getExternalTaskCredits']
  logError: QuestWrapperContextValue['logError']
  questSSR?: Quest
}) {
  const questResult = useGetQuest(questId, getQuest, !!questSSR)
  const questMeta = questSSR ?? questResult.data.data

  const queryClient = useQueryClient()
  const queryKey = `useGetRewards:${questId}:${questMeta?.rewards?.length}`

  const { t } = useTranslation()

  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const rewards: UseGetRewardsData[] = []
      const questRewards = questMeta?.rewards

      if (!questRewards) {
        return { rewards: [], rewardsByCategory: {} }
      }

      for (const reward_i of questRewards) {
        let numToClaim: string | undefined = undefined
        if (
          reward_i.amount_per_user &&
          reward_i.decimals !== undefined &&
          reward_i.decimals !== null
        ) {
          numToClaim = getDecimalNumberFromAmount(
            reward_i.amount_per_user.toString(),
            reward_i.decimals
          ).toString()
        }

        if (reward_i.reward_type === 'EXTERNAL-TASKS') {
          try {
            const taskAmountToClaim = await getExternalTaskCredits(
              reward_i.id.toString()
            )
            numToClaim = getDecimalNumberFromAmount(
              taskAmountToClaim,
              0
            ).toString()
          } catch (e) {
            logError(
              `Error getting external task credits for reward id ${reward_i}: ${e}`
            )
          }
        }

        if (
          reward_i.reward_type === 'ERC1155' &&
          reward_i.token_ids &&
          reward_i.token_ids.length
        ) {
          for (const token_i of reward_i.token_ids) {
            const questReward_i = {
              ...reward_i,
              title: reward_i.name,
              imageUrl: reward_i.image_url,
              chainName: getRewardCategory(reward_i, t),
              numToClaim: token_i.amount_per_user,
              numOfClaimsLeft: token_i.numClaimsLeft
            }
            rewards.push(questReward_i)
          }
        } else {
          const questReward_i = {
            ...reward_i,
            title: reward_i.name,
            imageUrl: reward_i.image_url,
            chainName: getRewardCategory(reward_i, t),
            numToClaim,
            numOfClaimsLeft: reward_i.numClaimsLeft
          }
          rewards.push(questReward_i)
        }
      }

      const rewardsByCategory: Record<string, UseGetRewardsData[]> = {}

      for (const reward_i of rewards) {
        if (Object.hasOwn(rewardsByCategory, reward_i.chainName)) {
          rewardsByCategory[reward_i.chainName].push(reward_i)
        } else {
          rewardsByCategory[reward_i.chainName] = [reward_i]
        }
      }

      return { rewards, rewardsByCategory }
    },
    refetchOnWindowFocus: false
  })

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () =>
      queryClient.invalidateQueries({ queryKey: [queryKey] })
  }
}
