import { QuestLogInfo } from '@hyperplay/ui'
import { Quest, UserPlayStreak } from '@hyperplay/utils'

export function getPlaystreakQuestStatus(
  quest: Quest,
  questPlayStreak: UserPlayStreak
): QuestLogInfo['state'] {
  const completedCounter = questPlayStreak.completed_counter
  const numTimesCompleteable = quest.num_of_times_repeatable

  const currentPlaystreak = questPlayStreak.current_playstreak_in_days
  const requiredPlaystreak =
    quest.eligibility?.play_streak.required_playstreak_in_days

  if (
    requiredPlaystreak !== undefined &&
    currentPlaystreak >= requiredPlaystreak
  ) {
    return 'READY_FOR_CLAIM'
  } else if (numTimesCompleteable === null) {
    return 'ACTIVE'
  } else if (completedCounter >= numTimesCompleteable) {
    return 'CLAIMED'
  }
  return 'ACTIVE'
}
