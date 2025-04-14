import {
  canClaimLeaderboardReward,
  canClaimPlayStreakReward
} from '@/helpers/rewards'
import { Quest, ExternalEligibility, UserPlayStreak } from '@hyperplay/utils'
import { useQueryClient, useQuery } from '@tanstack/react-query'

export function useCanClaimReward({
  quest,
  getExternalEligibility,
  getUserPlayStreak
}: {
  quest: Quest
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
}) {
  const queryClient = useQueryClient()
  const queryKey = ['canClaimReward', quest.id]
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (quest.type === 'LEADERBOARD') {
        const externalEligibility = await getExternalEligibility(quest.id)
        if (!externalEligibility) {
          console.warn(
            `No external eligibility found for quest ${quest.name} (${quest.id})`
          )
          return false
        }
        return canClaimLeaderboardReward(quest, externalEligibility)
      }

      if (quest.type === 'PLAYSTREAK') {
        const playstreakData = await getUserPlayStreak(quest.id)
        return canClaimPlayStreakReward(quest, playstreakData)
      }

      throw new Error('Invalid quest type')
    }
  })
  return {
    canClaim: query.data,
    ...query,
    invalidateQuery: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  }
}
