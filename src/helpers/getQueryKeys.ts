export const externalEligibilityQueryKeyPrefix = 'externalEligibility'
export const userPlayStreakQueryKeyPrefix = 'getUserPlayStreak'
export const canClaimRewardQueryKeyPrefix = 'canClaimReward'
export const getQuestQueryKeyPrefix = 'getQuest'
export const syncPlaysessionQueryKeyPrefix = 'syncPlaysession'
export const getQuestLogInfoQueryKeyPrefix = 'getQuestLogInfo'

export function getGetQuestQueryKey(questId: number | null) {
  return [getQuestQueryKeyPrefix, questId]
}

export function getGetUserPlayStreakQueryKey(questId: number | null) {
  return [userPlayStreakQueryKeyPrefix, questId]
}

export function getSyncPlaysessionQueryKey(projectId: string) {
  return [syncPlaysessionQueryKeyPrefix, projectId]
}

export function getGetQuestLogInfoQueryKey(questId: string) {
  return [getQuestLogInfoQueryKeyPrefix, questId]
}

export function getGetExternalEligibilityQueryKey(questId: number | null) {
  return [externalEligibilityQueryKeyPrefix, questId]
}

export function getCanClaimRewardQueryKey(questId: number | null) {
  return [canClaimRewardQueryKeyPrefix, questId]
}
