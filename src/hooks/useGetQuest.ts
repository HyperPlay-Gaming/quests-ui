import { getGetQuestQueryKey } from '@/helpers/getQueryKeys'
import { QuestWrapperContextValue } from '@/types/quests'
import { Quest } from '@hyperplay/utils'
import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query'

export function getQuestQueryOptions(
  questId: number | null,
  getQuest: (questId: number) => Promise<Quest>,
  disabled?: boolean
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
    enabled: questId !== null && !disabled,
    // choosing 60s over Infinity here to keep the num of claims left value fresh
    staleTime: 60 * 1000
  })
}

export function useGetQuest(
  questId: number | null,
  getQuest: QuestWrapperContextValue['getQuest'],
  disabled?: boolean
) {
  const queryClient = useQueryClient()
  const queryOption = getQuestQueryOptions(questId, getQuest, disabled)
  const query = useQuery(queryOption)

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () =>
      queryClient.invalidateQueries({ queryKey: [queryOption.queryKey] })
  }
}
