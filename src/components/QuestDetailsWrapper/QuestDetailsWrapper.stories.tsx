import type { Meta, StoryObj } from '@storybook/react'
import { QuestDetailsWrapper, QuestDetailsWrapperProps } from './index'

const meta: Meta<typeof QuestDetailsWrapper> = {
  component: QuestDetailsWrapper,
  title: 'Components/QuestDetailsWrapper'
}

export default meta

type Story = StoryObj<typeof QuestDetailsWrapper>

const mockProps: QuestDetailsWrapperProps = {
  selectedQuestId: 1,
  projectId: 'test-project',
  flags: {
    rewardTypeClaimEnabled: {
      ERC20: false,
      ERC721: false,
      ERC1155: false,
      POINTS: false,
      'EXTERNAL-TASKS': false
    },
    questsOverlayClaimCtaEnabled: false
  },
  getQuest: async () => {
    return {
      id: 1,
      project_id: 'test-project',
      name: 'Test Quest',
      type: 'REPUTATIONAL-AIRDROP',
      status: 'ACTIVE',
      description: 'This is a test quest',
      rewards: [
        {
          id: 1,
          name: 'Test Reward',
          contract_address: '0x123',
          decimals: 18,
          image_url: 'https://test.com/image.png',
          token_ids: [],
          numClaimsLeft: '100'
        }
      ],
      deposit_contracts: [],
      eligibility: {
        completion_threshold: 10,
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 1,
          minimum_session_time_in_seconds: 1
        }
      }
    }
  },
  getUserPlayStreak: async () => {
    return 0
  },
  getSteamGameMetadata: async () => {
    return {
      id: '1',
      name: 'Test Game',
      capsule_image: 'https://test.com/image.png'
    }
  },
  isSignedIn: false,
  trackEvent: () => { },
  signInWithSteamAccount: () => { },
  openSignInModal: () => { },
  logError: () => { },
  claimPoints: async () => { },
  completeExternalTask: async () => { },
  getQuestRewardSignature: async () => {
    return {
      signature: `0x123`,
      nonce: '0',
      expiration: 0,
      tokenIds: []
    }
  },
  confirmRewardClaim: async () => { },
  resyncExternalTask: async () => { },
  getExternalTaskCredits: async () => {
    return '100'
  },
  syncPlaySession: async () => { },
  logInfo: () => { },
  openDiscordLink: () => { },
  getDepositContracts: async () => {
    return []
  },
  checkG7ConnectionStatus: async () => {
    return false
  },
  getPendingExternalSync: async () => {
    return false
  },
  syncPlayStreakWithExternalSource: async () => {
    alert('sync play streak with external source')
  }
}

export const Default: Story = {
  args: mockProps,
}

