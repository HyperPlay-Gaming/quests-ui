export const externalEligibilityQueryKeyPrefix = 'externalEligibility'
export const userPlayStreakQueryKeyPrefix = 'getUserPlayStreak'

export function getGetQuestQueryKey(questId: number | null) {
  return ['getQuest', questId]
}

export function getGetUserPlayStreakQueryKey(questId: number | null) {
  return [userPlayStreakQueryKeyPrefix, questId]
}

export function getSyncPlaysessionQueryKey(projectId: string) {
  return ['syncPlaysession', projectId]
}

export function getGetQuestLogInfoQueryKey(questId: string) {
  return ['getQuestLogInfo', questId]
}

export function getGetExternalEligibilityQueryKey(questId: number | null) {
  return [externalEligibilityQueryKeyPrefix, questId]
}

export function getCanClaimRewardQueryKey(questId: number | null) {
  return ['canClaimReward', questId]
}
