import {
  useQuery,
  queryOptions,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { ExternalEligibility } from '@hyperplay/utils'
import { getGetExternalEligibilityQueryKey } from '@/helpers/getQueryKeys'

type UseGetExternalEligibilityProps = {
  questId: number | null
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
} & Omit<UseQueryOptions<ExternalEligibility | null>, 'queryKey' | 'queryFn'>

export function getExternalEligibilityQueryOptions(
  props: UseGetExternalEligibilityProps
) {
  const queryKey = getGetExternalEligibilityQueryKey(props.questId)
  return queryOptions({
    queryKey,
    queryFn: async () => {
      if (!props.questId) {
        return null
      }
      return props.getExternalEligibility(props.questId)
    },
    ...props
  })
}

export function useGetExternalEligibility({
  questId,
  getExternalEligibility,
  ...options
}: UseGetExternalEligibilityProps) {
  const queryClient = useQueryClient()
  const queryOption = getExternalEligibilityQueryOptions({
    questId,
    getExternalEligibility,
    ...options
  })
  const query = useQuery(queryOption)
  return {
    ...query,
    invalidateQuery: async () =>
      queryClient.invalidateQueries({ queryKey: queryOption.queryKey })
  }
}
