import { getGetQuestQueryKey } from '@/helpers/getQueryKeys'
import { Quest } from '@hyperplay/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function useGetQuest(
  questId: number | null,
  getQuest: (questId: number) => Promise<Quest>
) {
  const queryClient = useQueryClient()
  const queryKey = getGetQuestQueryKey(questId)
  const query = useQuery({
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
    enabled: questId !== null
  })

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () =>
      queryClient.invalidateQueries({ queryKey: [queryKey] })
  }
}
