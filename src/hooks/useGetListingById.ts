import { getGetListingByIdQueryKey } from '@/helpers/getQueryKeys'
import { QuestWrapperContextValue } from '@/types/quests'
import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query'

export function getListingByProjectIdQueryOptions(
  projectId: string | null,
  enabled: boolean,
  getListingByProjectId: QuestWrapperContextValue['getListingById']
) {
  const queryKey = getGetListingByIdQueryKey(projectId)
  return queryOptions({
    queryKey: [queryKey],
    queryFn: async () => {
      if (projectId === null) {
        return null
      }
      const response = await getListingByProjectId!(projectId)
      if (!response) return null
      return response
    },
    refetchOnWindowFocus: false,
    enabled:
      projectId !== null && getListingByProjectId !== undefined && enabled,
    // choosing 60s over Infinity here to keep the num of claims left value fresh
    staleTime: 60 * 1000
  })
}

export function useGetListingByProjectId(
  projectId: string | null,
  enabled: boolean,
  getListingByProjectId: QuestWrapperContextValue['getListingById']
) {
  const queryClient = useQueryClient()
  const queryOption = getListingByProjectIdQueryOptions(
    projectId,
    enabled,
    getListingByProjectId
  )
  const query = useQuery(queryOption)

  return {
    data: query,
    isLoading: query.isLoading || query.isFetching,
    invalidateQuery: async () =>
      queryClient.invalidateQueries({ queryKey: [queryOption.queryKey] })
  }
}
