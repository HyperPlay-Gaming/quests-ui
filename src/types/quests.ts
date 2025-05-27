import { QuestReward } from '@hyperplay/ui'
import {
  ConfirmClaimParams,
  DepositContract,
  Quest,
  Reward,
  RewardClaimSignature,
  Runner,
  UserPlayStreak,
  LogOptions,
  ExternalEligibility
} from '@hyperplay/utils'
import { TFunction } from 'i18next'
import { TrackEventFn } from './analytics'
import { Listing } from '@valist/sdk/dist/typesApi'

// @TODO pull into hp utils type
export type UseGetRewardsData = QuestReward &
  Reward & { num_claims_per_device: string }

export type ExternalEligibilityWithQuestId = ExternalEligibility & {
  questId: number
}

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

export class NotEnoughGasError extends Error {
  constructor() {
    super('Not enough balance')
    this.name = 'NotEnoughGasError'
  }
}

export interface QuestWrapperContextValue {
  flags: {
    rewardTypeClaimEnabled: Record<Reward['reward_type'], boolean>
    gameplayWalletSectionVisible: boolean
    questsOverlayClaimCtaEnabled?: boolean
  }
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibilityWithQuestId | null>
  getQuest: (questId: number) => Promise<Quest>
  getActiveWallet: () => Promise<string | null | undefined>
  getGameplayWallets: () => Promise<{ id: number; wallet_address: string }[]>
  updateActiveWallet: (walletId: number) => Promise<void>
  getActiveWalletSignature: () => Promise<{
    message: string
    signature: string
  }>
  setActiveWallet: ({
    message,
    signature
  }: {
    message: string
    signature: string
  }) => Promise<{ success: boolean; status: number; message?: string }>
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
  getSteamGameMetadata: (id: number) => Promise<{
    name?: string
    capsule_image?: string
  }>
  isSignedIn: boolean
  trackEvent: TrackEventFn
  signInWithSteamAccount: () => void
  openSignInModal: () => void
  logError: (msg: string, options?: LogOptions) => void
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
  onRewardClaimed?: (reward: Reward) => void
  onShowMetaMaskPopup?: () => void
  getListingById?: (projectId: string) => Promise<Listing>
}
