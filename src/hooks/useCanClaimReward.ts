import { useGetExternalEligibility } from './useGetExternalEligibility'
import { canClaimReward } from '@/helpers/rewards'
import { useGetQuest } from './useGetQuest'
import { useGetUserPlayStreak } from './useGetUserPlayStreak'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'

export function useCanClaimReward({ questId }: { questId: number }) {
  const { getQuest, getExternalEligibility, getUserPlayStreak } =
    useQuestWrapper()

  const { data: questQuery, isLoading: isQuestLoading } = useGetQuest(
    questId,
    getQuest
  )

  const { data: externalEligibility, isLoading: isExternalEligibilityLoading } =
    useGetExternalEligibility({
      questId,
      getExternalEligibility: getExternalEligibility
    })

  const { data: playstreakQuery, isLoading: isUserPlayStreakLoading } =
    useGetUserPlayStreak(questId, getUserPlayStreak)

  const isLoading =
    isQuestLoading || isExternalEligibilityLoading || isUserPlayStreakLoading

  if (isLoading) {
    return {
      canClaim: false,
      isLoading: true
    }
  }

  if (!questQuery.data) {
    return {
      canClaim: false,
      isLoading: false
    }
  }

  const canClaim = canClaimReward({
    quest: questQuery.data,
    externalEligibility,
    playstreakData: playstreakQuery.data?.userPlayStreak
  })

  return {
    canClaim,
    isLoading
  }
}
