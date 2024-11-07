import { getGetQuestQueryKey } from '@/helpers/getQueryKeys'
import { Quest } from '@hyperplay/utils'
import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query'

export function getQuestQueryOptions(
  questId: number | null,
  getQuest: (questId: number) => Promise<Quest>
) {
  const queryKey = getGetQuestQueryKey(questId)
  return queryOptions({
    queryKey: [queryKey],
    queryFn: async () => {
      if (questId === null) {
        return null
      }
      const response = await getQuest(questId)
      if (!response) return null
      return response
    },
    refetchOnWindowFocus: false,
    enabled: questId !== null,
    // choosing 60s over Infinity here to keep the num of claims left value fresh
    staleTime: 60 * 1000
  })
}

export function useGetQuest(
  questId: number | null,
  getQuest: (questId: number) => Promise<Quest>
) {
  const queryClient = useQueryClient()
  const queryOption = getQuestQueryOptions(questId, getQuest)
  const query = useQuery(queryOption)

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () =>
      queryClient.invalidateQueries({ queryKey: [queryOption.queryKey] })
  }
}
