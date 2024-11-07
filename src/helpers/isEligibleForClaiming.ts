import { Quest, UserPlayStreak } from '@hyperplay/utils'

export function isEligibleForClaiming({
  questMeta,
  questPlayStreakData
}: {
  questMeta?: Quest | null
  questPlayStreakData?: UserPlayStreak | null
}) {
  let isEligible = false

  if (!questMeta) {
    isEligible = false
  } else if (questMeta.type === 'PLAYSTREAK') {
    const currentStreak = questPlayStreakData?.current_playstreak_in_days
    const requiredStreak =
      questMeta.eligibility?.play_streak?.required_playstreak_in_days

    if (currentStreak && requiredStreak) {
      isEligible = currentStreak >= requiredStreak
    }
  }

  return isEligible
}
