import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { getGetExternalEligibilityQueryKey } from './getQueryKeys'

export function getExternalEligibilityQueryProps({
  quest,
  getExternalEligibility
}: {
  quest: Quest
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
}) {
  return {
    queryKey: getGetExternalEligibilityQueryKey(quest.id),
    queryFn: async () => getExternalEligibility(quest.id)
  }
}
