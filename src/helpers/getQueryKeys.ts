import { Quest } from '@hyperplay/utils'

export const externalEligibilityQueryKeyPrefix = 'externalEligibility'
export const userPlayStreakQueryKeyPrefix = 'getUserPlayStreak'
export const canClaimRewardQueryKeyPrefix = 'canClaimReward'
export const getQuestQueryKeyPrefix = 'getQuest'
export const syncPlaysessionQueryKeyPrefix = 'syncPlaysession'
export const getQuestLogInfoQueryKeyPrefix = 'getQuestLogInfo'
export const getListingByIdQueryKeyPrefix = 'getListing'

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

export function getGetListingByIdQueryKey(projectId: string | null) {
  return [getListingByIdQueryKeyPrefix, projectId]
}

// make ts force us to add a new query key when a new quest type is added
export const eligibilityQueryKeyPrefixes: Record<Quest['type'], string> = {
  PLAYSTREAK: userPlayStreakQueryKeyPrefix,
  LEADERBOARD: externalEligibilityQueryKeyPrefix,
  // TODO: use the correct query key for the reputational airdrop if we implement it in the future
  'REPUTATIONAL-AIRDROP': externalEligibilityQueryKeyPrefix
}

export function getEligibilityQueryKeys(
  questId: number | null
): Record<Quest['type'], (string | number | null)[]> {
  return {
    PLAYSTREAK: getGetUserPlayStreakQueryKey(questId),
    LEADERBOARD: getGetExternalEligibilityQueryKey(questId),
    'REPUTATIONAL-AIRDROP': getGetExternalEligibilityQueryKey(questId)
  }
}
