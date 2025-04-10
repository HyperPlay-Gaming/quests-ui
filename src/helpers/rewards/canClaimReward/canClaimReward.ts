import { getPlaystreakQuestStatus } from '@/helpers/getPlaystreakQuestStatus'
import { ExternalEligibility, Quest, UserPlayStreak } from '@hyperplay/utils'

export function canClaimLeaderboardReward(
  quest: Quest,
  externalEligibility: ExternalEligibility | null | undefined
) {
  if (quest.status !== 'CLAIMABLE') {
    return false
  }
  return externalEligibility?.amount > 0
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

export function canClaimReward({
  quest,
  externalEligibility,
  playstreakData
}: {
  quest: Quest
  externalEligibility: ExternalEligibility | null | undefined
  playstreakData: UserPlayStreak | null | undefined
}) {
  switch (quest.type) {
    case 'LEADERBOARD':
      if (!externalEligibility) return false
      return canClaimLeaderboardReward(quest, externalEligibility)
    case 'PLAYSTREAK':
      if (!playstreakData) return false
      return canClaimPlayStreakReward(quest, playstreakData)
    default:
      throw new Error('Invalid quest type')
  }
}
