import { createContext, useContext, ReactNode } from 'react'
import { TFunction } from 'i18next'
import { TrackEventFn } from '@/types/analytics'
import {
  ConfirmClaimParams,
  DepositContract,
  Quest,
  Reward,
  RewardClaimSignature,
  Runner
} from '@hyperplay/utils'

interface QuestWrapperContextValue {
  flags: {
    rewardTypeClaimEnabled: Record<Reward['reward_type'], boolean>
    questsOverlayClaimCtaEnabled?: boolean
  }
  getQuest: (questId: number) => any
  getUserPlayStreak: (questId: number) => any
  getSteamGameMetadata: (id: number) => any
  isSignedIn: boolean
  trackEvent: TrackEventFn
  signInWithSteamAccount: () => void
  openSignInModal: () => void
  logError: (msg: string) => void
  claimPoints: (reward: Reward) => Promise<any>
  completeExternalTask: (reward: Reward) => Promise<any>
  getQuestRewardSignature: (
    address: `0x${string}`,
    rewardId: number,
    tokenId?: number
  ) => Promise<RewardClaimSignature>
  getPendingExternalSync: (questId: number) => Promise<boolean>
  confirmRewardClaim: (params: ConfirmClaimParams) => Promise<void>
  syncPlayStreakWithExternalSource: (questId: number) => Promise<unknown>
  resyncExternalTask: (rewardId: string) => Promise<void>
  getExternalTaskCredits: (rewardId: string) => Promise<string>
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>
  logInfo: (message: string) => void
  openDiscordLink: () => void
  getDepositContracts: (questId: number) => Promise<DepositContract[]>
  tOverride?: TFunction<any, string>
  sessionEmail?: string
  checkG7ConnectionStatus: () => Promise<boolean>
  isQuestsPage?: boolean
  onPlayClick: (quest: Quest) => void
  onRewardsClaimed?: (rewards: Reward[]) => void
}

const QuestWrapperContext = createContext<QuestWrapperContextValue | undefined>(
  undefined
)

export const useQuestWrapper = () => {
  const context = useContext(QuestWrapperContext)
  if (!context) {
    throw new Error('useQuestWrapper must be used within QuestWrapperProvider')
  }
  return context
}

interface QuestWrapperProviderProps extends QuestWrapperContextValue {
  children: ReactNode
}

export const QuestWrapperProvider = ({
  children,
  ...props
}: QuestWrapperProviderProps) => {
  return (
    <QuestWrapperContext.Provider value={props}>
      {children}
    </QuestWrapperContext.Provider>
  )
}
