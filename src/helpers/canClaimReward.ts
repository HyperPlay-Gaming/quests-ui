import { getPlaystreakQuestStatus } from '@/helpers/getPlaystreakQuestStatus'
import { ExternalEligibility, Quest, UserPlayStreak } from '@hyperplay/utils'

export function canClaimLeaderboardReward(
  quest: Quest,
  externalEligibility: ExternalEligibility
) {
  if (quest.status !== 'CLAIMABLE') {
    return false
  }
  return BigInt(externalEligibility.amount) > BigInt(0)
}

export function canClaimPlayStreakReward(
  quest: Quest,
  questPlayStreakData: UserPlayStreak
) {
  const playstreakQuestStatus = getPlaystreakQuestStatus(
    quest,
    questPlayStreakData
  )
  return playstreakQuestStatus === 'READY_FOR_CLAIM'
}
