import { PlayStreakEligibility } from '@hyperplay/ui'
import { Quest, UserPlayStreak } from '@hyperplay/utils'
import { ReactNode } from 'react'

// this is initialized when the overlay is started for this game
let dateTimeCurrentSessionStartedInMsSinceEpoch = Date.now()

export function getPlaystreakArgsFromQuestData({
  questMeta,
  questPlayStreakData,
  useModuleInitTimeForSessionStartTime,
  rightSection,
}: {
  questMeta: Quest
  questPlayStreakData: UserPlayStreak | undefined | null
  useModuleInitTimeForSessionStartTime?: boolean
  rightSection?: ReactNode
}): PlayStreakEligibility {
  let sessionStartedTime = undefined
  if (useModuleInitTimeForSessionStartTime) {
    sessionStartedTime = dateTimeCurrentSessionStartedInMsSinceEpoch
  }
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
    dateTimeCurrentSessionStartedInMsSinceEpoch: sessionStartedTime
  }
}

export function resetSessionStartedTime() {
  dateTimeCurrentSessionStartedInMsSinceEpoch = Date.now()
}
