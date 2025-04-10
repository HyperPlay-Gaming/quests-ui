import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { LoginWarningBanner } from './LoginWarningBanner'
import { Quest } from '@hyperplay/utils'
import { LeaderboardBanner } from './LeaderboardBanner'
import { HTMLAttributes } from 'react'

export type RewardsBannerProps = HTMLAttributes<HTMLDivElement> & {
  quest: Quest
}

export default function RewardsBanner({
  quest,
  className
}: RewardsBannerProps) {
  const { isSignedIn } = useQuestWrapper()

  if (!isSignedIn) {
    return <LoginWarningBanner className={className} />
  }

  if (quest.type === 'LEADERBOARD') {
    return <LeaderboardBanner quest={quest} />
  }

  return null
}
