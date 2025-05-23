import {
  useQuery,
  queryOptions,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { getExternalEligibilityQueryProps } from '@/helpers/queryProps'
import { ExternalEligibilityWithQuestId } from '@/types/quests'

type UseGetExternalEligibilityProps = {
  questId: number
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibilityWithQuestId | null>
} & Omit<
  UseQueryOptions<ExternalEligibilityWithQuestId | null>,
  'queryKey' | 'queryFn'
>

export function getExternalEligibilityQueryOptions(
  props: UseGetExternalEligibilityProps
) {
  const queryProps = getExternalEligibilityQueryProps({
    questId: props.questId,
    getExternalEligibility: props.getExternalEligibility
  })
  return queryOptions({
    ...queryProps,
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
