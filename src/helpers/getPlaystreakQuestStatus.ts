import { QuestLogInfo } from '@hyperplay/ui'
import { Quest, UserPlayStreak } from '@hyperplay/utils'

export function getPlaystreakQuestStatus(
  quest: Quest,
  questPlayStreak: UserPlayStreak
): QuestLogInfo['state'] | undefined {
  const completedCounter = questPlayStreak.completed_counter
  const numTimesCompleteable = quest.num_of_times_repeatable

  const currentPlaystreak = questPlayStreak.current_playstreak_in_days
  if (quest.eligibility?.play_streak === undefined) {
    throw 'no playstreak eligibility criteria provided. cannot get quest status'
  }
  const requiredPlaystreak =
    quest.eligibility.play_streak.required_playstreak_in_days

  const gameIsInfinitelyCompleteable = numTimesCompleteable === null
  const gameHasMoreFiniteCompletionsPossible =
    completedCounter < (numTimesCompleteable ?? Number.MAX_VALUE)
  if (
    currentPlaystreak >= requiredPlaystreak &&
    (gameIsInfinitelyCompleteable || gameHasMoreFiniteCompletionsPossible)
  ) {
    return 'READY_FOR_CLAIM'
  } else if (quest.status === 'COMPLETED') {
    return undefined
  } else if (gameIsInfinitelyCompleteable) {
    return 'ACTIVE'
  } else if (!gameHasMoreFiniteCompletionsPossible) {
    return 'CLAIMED'
  }

  return 'ACTIVE'
}
