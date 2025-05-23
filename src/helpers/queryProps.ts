import { ExternalEligibilityWithQuestId } from '@/types/quests'
import { getGetExternalEligibilityQueryKey } from './getQueryKeys'

export function getExternalEligibilityQueryProps({
  questId,
  getExternalEligibility
}: {
  questId: number
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibilityWithQuestId | null>
}) {
  return {
    queryKey: getGetExternalEligibilityQueryKey(questId),
    queryFn: async () => getExternalEligibility(questId)
  }
}
