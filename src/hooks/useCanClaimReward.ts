import {
  canClaimLeaderboardReward,
  canClaimPlayStreakReward
} from '@/helpers/canClaimReward'
import {
  eligibilityQueryKeyPrefixes,
  getCanClaimRewardQueryKey,
  getEligibilityQueryKeys
} from '@/helpers/getQueryKeys'
import { getExternalEligibilityQueryProps } from '@/helpers/queryProps'
import { ExternalEligibilityWithQuestId } from '@/types/quests'
import { Quest, UserPlayStreak } from '@hyperplay/utils'
import {
  useQueryClient,
  useQuery,
  UseQueryOptions,
  Query
} from '@tanstack/react-query'

type Props = {
  quest: Quest
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibilityWithQuestId | null>
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
            questId: quest.id,
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
    invalidateQuery: async (questId?: number | null) => {
      let predicateFn: (query: Query) => boolean

      // the reason we only target quest id is to avoid resetting all the eligibilities at the same time
      // and get rate limited by the API
      if (questId) {
        const eligibilityQueryKeys = getEligibilityQueryKeys(questId)
        predicateFn = (query: Query) =>
          Object.values(eligibilityQueryKeys).some(
            (key) => JSON.stringify(key) === JSON.stringify(query.queryKey)
          )
      } else {
        predicateFn = (query: Query) =>
          Object.values(eligibilityQueryKeyPrefixes).includes(
            query.queryKey[0] as string
          )
      }

      // we want to invalidate the eligibility queries before re-running this hook's queryFn
      await queryClient.invalidateQueries({
        predicate: predicateFn
      })

      await queryClient.invalidateQueries({ queryKey })
    }
  }
}
