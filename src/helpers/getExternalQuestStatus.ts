import { QuestLogInfo } from '@hyperplay/ui'
import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { canClaimLeaderboardReward } from './canClaimReward'

// TODO: handle claimed
export function getExternalQuestStatus(
  quest: Quest,
  externalEligibility: ExternalEligibility | null
): QuestLogInfo['state'] | undefined {
  if (quest.status === 'ACTIVE' || quest.status === 'COMPLETED') {
    return 'ACTIVE'
  }

  if (quest.status === 'CLAIMABLE') {
    if (
      !externalEligibility ||
      !canClaimLeaderboardReward(quest, externalEligibility)
    ) {
      return undefined
    }

    return 'READY_FOR_CLAIM'
  }

  return undefined
}
