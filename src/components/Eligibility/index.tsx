import { Quest } from '@hyperplay/utils'
import { QuestDetailsWrapperProps } from '../QuestDetailsWrapper'
import { PlayStreakEligibilityWrapper } from '../PlayStreakEligibilityWrapper'
import { ExternalEligibility } from '../ExternalEligibility'
export type EligibilityProps = QuestDetailsWrapperProps & {
  quest: Quest
}

export function Eligibility({ quest, streakIsProgressing }: EligibilityProps) {
  if (quest.type === 'PLAYSTREAK') {
    return (
      <PlayStreakEligibilityWrapper
        questId={quest.id}
        streakIsProgressing={streakIsProgressing}
      />
    )
  }

  if (quest.type === 'LEADERBOARD') {
    return <ExternalEligibility externalLink={''} />
  }

  return null
}
