import {
  useQuery,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { ExternalEligibility } from '@hyperplay/utils'

type UseGetExternalEligibilityProps = {
  questId: number | null
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
} & Omit<UseQueryOptions<ExternalEligibility | null>, 'queryKey' | 'queryFn'>

export function useGetExternalEligibility({
  questId,
  getExternalEligibility,
  ...options
}: UseGetExternalEligibilityProps) {
  const queryKey = ['externalEligibility', questId]
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!questId) {
        return null
      }
      return getExternalEligibility(questId)
    },
    ...options
  })
  return {
    ...query,
    invalidateQuery: async () => queryClient.invalidateQueries({ queryKey })
  }
}
