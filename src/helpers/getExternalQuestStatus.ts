import { QuestLogInfo } from '@hyperplay/ui'
import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { canClaimLeaderboardReward } from './canClaimReward'
import dayjs from 'dayjs'

export function getExternalQuestStatus(
  quest: Quest,
  externalEligibility: ExternalEligibility | null
): QuestLogInfo['state'] | undefined {
  const questEnded = quest.end_date
    ? dayjs(quest.end_date).isBefore(dayjs())
    : false

  if (quest.status === 'COMPLETED') {
    return undefined
  }

  if (quest.status === 'ACTIVE') {
    return 'ACTIVE'
  }

  if (quest.status === 'CLAIMABLE') {
    if (!questEnded) {
      return 'ACTIVE'
    }

    if (!externalEligibility) {
      return undefined
    }

    const canClaim = canClaimLeaderboardReward(quest, externalEligibility)
    return canClaim ? 'READY_FOR_CLAIM' : undefined
  }
}
