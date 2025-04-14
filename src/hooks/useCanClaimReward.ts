import {
  canClaimLeaderboardReward,
  canClaimPlayStreakReward
} from '@/helpers/rewards'
import { Quest, ExternalEligibility, UserPlayStreak } from '@hyperplay/utils'
import {
  useQueryClient,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'

type Props = {
  quest: Quest
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
} & Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>

export function useCanClaimReward({
  quest,
  getExternalEligibility,
  getUserPlayStreak,
  ...options
}: Props) {
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
    },
    ...options
  })
  return {
    canClaim: query.data,
    ...query,
    invalidateQuery: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  }
}
