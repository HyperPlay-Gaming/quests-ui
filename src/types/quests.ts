import { QuestReward } from '@hyperplay/ui'
import {
  ConfirmClaimParams,
  DepositContract,
  Quest,
  Reward,
  RewardClaimSignature,
  Runner,
  UserPlayStreak
} from '@hyperplay/utils'
import { TFunction } from 'i18next'
import { TrackEventFn } from './analytics'

export type UseGetRewardsData = QuestReward & Reward

export class ClaimError extends Error {
  properties: any

  constructor(message: string, properties: any) {
    super(message)
    this.properties = properties
  }
}

export class WarningError extends Error {
  constructor(
    public title: string,
    message: string
  ) {
    super(message)
    this.name = 'WarningError'
  }
}

export interface QuestWrapperContextValue {
  flags: {
    rewardTypeClaimEnabled: Record<Reward['reward_type'], boolean>
    questsOverlayClaimCtaEnabled?: boolean
  }
  getQuest: (questId: number) => Promise<Quest>
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
  getSteamGameMetadata: (id: number) => Promise<{
    name?: string
    capsule_image?: string
  }>
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
