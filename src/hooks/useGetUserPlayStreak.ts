import { getGetUserPlayStreakQueryKey } from '@/helpers/getQueryKeys'
import { UserPlayStreak } from '@hyperplay/utils'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'

export function getUserPlaystreakQueryOptions(
  questId: number | null,
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
) {
  const queryKey = getGetUserPlayStreakQueryKey(questId)
  return queryOptions({
    queryKey,
    queryFn: async () => {
      if (questId === null) {
        return null
      }
      const response = await getUserPlayStreak(questId)
      if (!response) return null
      return { questId: questId, userPlayStreak: response }
    },
    refetchOnWindowFocus: false,
    enabled: questId !== null
  })
}

export function useGetUserPlayStreak(
  questId: number | null,
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
) {
  const queryClient = useQueryClient()
  const queryKey = getGetUserPlayStreakQueryKey(questId)
  const query = useQuery(
    getUserPlaystreakQueryOptions(questId, getUserPlayStreak)
  )

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () => queryClient.invalidateQueries({ queryKey })
  }
}
