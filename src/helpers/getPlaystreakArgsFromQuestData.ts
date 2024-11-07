import { PlayStreakEligibility } from '@hyperplay/ui'
import { Quest, UserPlayStreak } from '@hyperplay/utils'
import { ReactNode } from 'react'

export function getPlaystreakArgsFromQuestData({
  questMeta,
  questPlayStreakData,
  rightSection,
  dateTimeCurrentSessionStartedInMsSinceEpoch
}: {
  questMeta: Quest
  questPlayStreakData: UserPlayStreak | undefined | null
  rightSection?: ReactNode
  dateTimeCurrentSessionStartedInMsSinceEpoch: number
}): PlayStreakEligibility {
  return {
    rightSection,
    requiredStreakInDays:
      questMeta?.eligibility?.play_streak.required_playstreak_in_days ?? 0,
    currentStreakInDays: questPlayStreakData?.current_playstreak_in_days ?? 0,
    minimumSessionTimeInSeconds:
      questMeta?.eligibility?.play_streak.minimum_session_time_in_seconds ?? 0,
    lastPlaySessionCompletedDateTimeUTC:
      questPlayStreakData?.last_play_session_completed_datetime ??
      new Date().toISOString(),
    accumulatedPlaytimeTodayInSeconds:
      questPlayStreakData?.accumulated_playtime_today_in_seconds ?? 0,
    dateTimeCurrentSessionStartedInMsSinceEpoch
  }
}
