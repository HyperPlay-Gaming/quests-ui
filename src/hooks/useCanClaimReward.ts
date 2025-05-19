import {
  canClaimLeaderboardReward,
  canClaimPlayStreakReward
} from '@/helpers/canClaimReward'
import { getCanClaimRewardQueryKey } from '@/helpers/getQueryKeys'
import { getExternalEligibilityQueryProps } from '@/helpers/queryProps'
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
  const queryKey = getCanClaimRewardQueryKey(quest.id)
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (quest.type === 'LEADERBOARD') {
        const externalEligibility = await queryClient.ensureQueryData(
          getExternalEligibilityQueryProps({
            quest,
            getExternalEligibility
          })
        )
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
    invalidateQuery: async () => queryClient.invalidateQueries({ queryKey })
  }
}
