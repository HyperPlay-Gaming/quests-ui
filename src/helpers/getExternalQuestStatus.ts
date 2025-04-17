import { QuestLogInfo } from '@hyperplay/ui'
import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { canClaimLeaderboardReward } from './canClaimReward'

export function getExternalQuestStatus(
  quest: Quest,
  externalEligibility: ExternalEligibility | null
): QuestLogInfo['state'] | undefined {
  if (quest.status === 'COMPLETED') {
    return undefined
  }

  if (quest.status === 'ACTIVE') {
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
}
