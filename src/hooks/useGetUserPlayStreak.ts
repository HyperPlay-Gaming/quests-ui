import { UserPlayStreak } from '@hyperplay/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function useGetUserPlayStreak(
  questId: number | null,
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
) {
  const queryClient = useQueryClient()
  const queryKey = ['getUserPlayStreak', questId]
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (questId === null) {
        return null
      }
      const response = await getUserPlayStreak(questId)
      if (!response) return null
      return response
    },
    refetchOnWindowFocus: false,
    enabled: questId !== null
  })

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () => queryClient.invalidateQueries({ queryKey })
  }
}
