import {
  useQuery,
  queryOptions,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { ExternalEligibility } from '@hyperplay/utils'
import { getGetExternalEligibilityQueryKey } from '@/helpers/getQueryKeys'

type UseGetExternalEligibilityProps = {
  questId: number
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
} & Omit<UseQueryOptions<{ questId: number; externalEligibility: ExternalEligibility | null }>, 'queryKey' | 'queryFn'>

export function getExternalEligibilityQueryOptions(
  props: UseGetExternalEligibilityProps
) {
  const queryKey = getGetExternalEligibilityQueryKey(props.questId)
  return queryOptions({
    queryKey,
    queryFn: async () => {
      const response = await props.getExternalEligibility(props.questId)
      return { questId: props.questId, externalEligibility: response }
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
