export function getGetQuestQueryKey(questId: number | null) {
  return ['getQuest', questId]
}

export function getGetUserPlayStreakQueryKey(questId: number | null) {
  return ['getUserPlayStreak', questId]
}

export function getSyncPlaysessionQueryKey(projectId: string) {
  return ['syncPlaysession', projectId]
}

export function getGetQuestLogInfoQueryKey(questId: string) {
  return ['getQuestLogInfo', questId]
}

export function getGetExternalEligibilityQueryKey(questId: number | null) {
  return ['externalEligibility', questId]
}
