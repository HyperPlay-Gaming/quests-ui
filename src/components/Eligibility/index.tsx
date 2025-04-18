import { Quest } from '@hyperplay/utils'
import { QuestDetailsWrapperProps } from '../QuestDetailsWrapper'
import { PlayStreakEligibilityWrapper } from '../PlayStreakEligibilityWrapper'
import { ExternalEligibility } from '../ExternalEligibility'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import ActiveWalletSection from '../ActiveWalletSection'
import styles from './index.module.scss'

export type EligibilityProps = QuestDetailsWrapperProps & {
  quest: Quest
}

export function Eligibility({ quest, streakIsProgressing }: EligibilityProps) {
  const { isSignedIn, flags } = useQuestWrapper()
  let eligibilityComponent = null

  if (quest.type === 'PLAYSTREAK') {
    eligibilityComponent = (
      <PlayStreakEligibilityWrapper
        questId={quest.id}
        streakIsProgressing={streakIsProgressing}
      />
    )
  }

  if (quest.type === 'LEADERBOARD') {
    eligibilityComponent = (
      <ExternalEligibility externalLink={quest.leaderboard_url} />
    )
  }

  const gameplayWalletSectionVisible = Boolean(
    flags.gameplayWalletSectionVisible
  )

  const shouldShowActiveWalletSection =
    isSignedIn && gameplayWalletSectionVisible

  return (
    <div className={styles.container}>
      {shouldShowActiveWalletSection ? <ActiveWalletSection /> : null}
      {eligibilityComponent}
    </div>
  )
}
