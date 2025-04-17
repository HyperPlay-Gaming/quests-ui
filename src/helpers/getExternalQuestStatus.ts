import { QuestLogInfo } from '@hyperplay/ui'
import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { canClaimLeaderboardReward } from './canClaimReward'

export function getExternalQuestStatus(
  quest: Quest,
  externalEligibility: ExternalEligibility
): QuestLogInfo['state'] | undefined {
  const canClaim = canClaimLeaderboardReward(quest, externalEligibility)
  if (canClaim) {
    return 'READY_FOR_CLAIM'
  } else if (quest.status === 'COMPLETED') {
    return undefined
  } else if (quest.status === 'ACTIVE') {
    return 'ACTIVE'
  }
}
