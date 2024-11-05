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
      name: '🦖 Craft World’s Ultimate Play Streak Quest 🔥 🚀',
      type: 'PLAY-STREAK',
      status: 'ACTIVE',
      description: `Embrace the Ultimate Play Streak Quest by Craft World! 🎮 Play daily to earn rewards, contribute to the Masterpiece, and climb the leaderboard. 🏆

👉 Quest: Play 5+ minutes/day for 7 consecutive days within our 30-day campaign.
💰 Rewards: 200,000 in-game Dyno Coins and Game7 Credits! Dyno Coins are THE in-game currency for resources.

Rise among Craft World's top ranks. 🚀 Join now and make your mark before the masterpiece is completed! 🔥🎮`,
      rewards: [
        {
          id: 1,
          name: 'Dyno Coin',
          contract_address: '0xb85Df74eB6db8C2D87c3bD7d4Ee1A27929643dA3',
          decimals: 18,
          image_url:
            'https://gateway.valist.io/ipfs/bafkreicwp22quggyljn3b4km2we2asaq256yyfa2qyxrapu7qnuasbbnrq',
          token_ids: [],
          numClaimsLeft: '2357',
          amount_per_user: '200000000000000000000000',
          chain_id: 84532,
          reward_type: 'ERC20'
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
  isSignedIn: true,
  trackEvent: () => {},
  signInWithSteamAccount: () => {},
  openSignInModal: () => {},
  logError: () => {},
  claimPoints: async () => {},
  completeExternalTask: async () => {},
  getQuestRewardSignature: async () => {
    return {
      signature: `0x123`,
      nonce: '0',
      expiration: 0,
      tokenIds: []
    }
  },
  confirmRewardClaim: async () => {},
  resyncExternalTask: async () => {},
  getExternalTaskCredits: async () => {
    return '100'
  },
  syncPlaySession: async () => {},
  logInfo: () => {},
  openDiscordLink: () => {},
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

export const PlayStreakQuest: Story = {
  args: mockProps
}
