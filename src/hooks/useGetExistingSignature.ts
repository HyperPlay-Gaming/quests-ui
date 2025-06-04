import { getGetExistingSignatureQueryKey } from '@/helpers/getQueryKeys'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { useQuery } from '@tanstack/react-query'

export function useGetExistingSignature({
  questId,
  rewardId
}: {
  questId: number | null
  rewardId: number
}) {
  const { getExistingSignature } = useQuestWrapper()
  const query = useQuery({
    queryKey: getGetExistingSignatureQueryKey(questId, rewardId),
    queryFn: async () => {
      if (!questId) return null
      return getExistingSignature(questId, rewardId)
    },
    enabled: Boolean(questId)
  })
  return {
    ...query,
    invalidate: async () => query.refetch()
  }
}
