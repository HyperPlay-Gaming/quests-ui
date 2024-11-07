import type { Meta, StoryObj } from '@storybook/react'
import { QuestDetailsWrapper, QuestDetailsWrapperProps } from './index'
import styles from './story-styles.module.scss'
import { Quest, UserPlayStreak } from '@hyperplay/utils'

const meta: Meta<typeof QuestDetailsWrapper> = {
  component: QuestDetailsWrapper,
  title: 'Components/QuestDetailsWrapper',
  render: (args) => (
    <div style={{ height: 'calc(100vh - 100px)' }}>
      {<QuestDetailsWrapper {...args} />}
    </div>
  )
}

export default meta

type Story = StoryObj<typeof QuestDetailsWrapper>

const mockQuest: Quest = {
  id: 1,
  project_id: 'test-project',
  name: "🦖 Craft World's Ultimate Play Streak Quest 🔥 🚀",
  type: 'PLAYSTREAK',
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
      amount_per_user: 200000000000000000000000,
      chain_id: 84532,
      reward_type: 'ERC20',
      marketplace_url: 'https://test.com'
    },
    {
      id: 2,
      name: 'G7 Credits',
      contract_address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      image_url: 'https://gateway-b3.valist.io/hyperplay/game7passport.png',
      token_ids: [],
      amount_per_user: 100000000000000000000000,
      chain_id: 84532,
      reward_type: 'EXTERNAL-TASKS',
      marketplace_url: 'https://test.com',
      numClaimsLeft: '2357'
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
  },
  quest_external_game: null,
  num_of_times_repeatable: 0
}

const mockUserPlayStreak: UserPlayStreak = {
  current_playstreak_in_days: 0,
  completed_counter: 0,
  accumulated_playtime_today_in_seconds: 0,
  last_play_session_completed_datetime: ''
}

const mockProps: QuestDetailsWrapperProps = {
  className: styles.root,
  selectedQuestId: 1,
  flags: {
    rewardTypeClaimEnabled: {
      ERC20: true,
      ERC721: true,
      ERC1155: true,
      POINTS: true,
      'EXTERNAL-TASKS': true
    },
    questsOverlayClaimCtaEnabled: false
  },
  onPlayClick: () => alert('onPlayClick'),
  getQuest: async () => {
    return mockQuest
  },
  getUserPlayStreak: async () => {
    return mockUserPlayStreak
  },
  getSteamGameMetadata: async () => {
    return {
      id: '1',
      name: 'Test Game',
      capsule_image: 'https://test.com/image.png'
    }
  },
  isSignedIn: false,
  trackEvent: () => {},
  signInWithSteamAccount: () => {},
  openSignInModal: () => alert('openSignInModal'),
  logError: () => {},
  claimPoints: async () => {},
  completeExternalTask: async () => {
    alert('complete external task')
  },
  getQuestRewardSignature: async () => {
    return {
      signature: `0x123`,
      nonce: '0',
      expiration: 0,
      tokenIds: []
    }
  },
  confirmRewardClaim: async () => {
    alert('confirm reward claim')
  },
  resyncExternalTask: async () => {
    console.log('resync external task')
  },
  getExternalTaskCredits: async () => {
    return '100'
  },
  syncPlaySession: async () => {
    console.log('sync play session')
  },
  logInfo: () => console.log,
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

export const QuestPageNotSignedIn: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true
  }
}

export const QuestPageSignedIn: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true
  }
}

export const QuestPageSignedInEligible: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true,
    getUserPlayStreak: async () => {
      return {
        current_playstreak_in_days: 5,
        completed_counter: 0,
        accumulated_playtime_today_in_seconds: 0,
        last_play_session_completed_datetime: ''
      }
    },
    checkG7ConnectionStatus: async () => {
      return true
    }
  }
}

export const OverlayNotSignedIn: Story = {
  args: {
    ...mockProps
  }
}

export const OverlaySignedIn: Story = {
  args: {
    ...mockProps,
    isSignedIn: true
  }
}

export const OverlaySignedInEligible: Story = {
  args: {
    ...mockProps,
    isSignedIn: true,
    getUserPlayStreak: async () => {
      return {
        current_playstreak_in_days: 5,
        completed_counter: 0,
        accumulated_playtime_today_in_seconds: 0,
        last_play_session_completed_datetime: ''
      }
    }
  }
}

export const PendingExternalSync: Story = {
  args: {
    ...mockProps,
    isSignedIn: true,
    getPendingExternalSync: async () => {
      return true
    }
  }
}
