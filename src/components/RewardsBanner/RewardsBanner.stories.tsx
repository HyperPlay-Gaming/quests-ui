import type { Meta, StoryObj } from '@storybook/react'
import RewardsBanner from '.'
import { createQueryClientDecorator } from '@/helpers/createQueryClientDecorator'
import { QuestWrapperProvider } from '@/state/QuestWrapperProvider'
import { QuestDetailsWrapperProps } from '../QuestDetailsWrapper'
import { Quest } from '@hyperplay/utils'
import dayjs from 'dayjs'
import styles from './story-styles.module.scss'

const mockQuest: Quest = {
  id: 1,
  end_date: dayjs().add(1, 'year').toISOString(),
  start_date: null,
  project_id:
    '0x36484d1723bba04a21430c5b50fc62737e4eca581cd806a36665a931e20d6f06',
  name: "🦖 Craft World's Ultimate Play Streak Quest 🔥 🚀",
  type: 'LEADERBOARD',
  status: 'COMPLETED',
  description: `Embrace the Ultimate Play Streak Quest by Craft World! 🎮 Play daily to earn rewards, contribute to the Masterpiece, and climb the leaderboard. 🏆
    
    👉 Quest: Play 5+ minutes/day for 7 consecutive days within our 30-day campaign.
    💰 Rewards: 200,000 in-game Dyno Coins and Game7 Credits! Dyno Coins are THE in-game currency for resources.
    
    Rise among Craft World's top ranks. 🚀 Join now and make your mark before the masterpiece is completed! 🔥🎮`,
  rewards: [
    {
      id: 1,
      name: '$MNT',
      contract_address: '0xb85Df74eB6db8C2D87c3bD7d4Ee1A27929643dA3',
      decimals: 18,
      image_url: '/images/mantle-icon.png',
      token_ids: [],
      numClaimsLeft: '2357',
      amount_per_user: 2000000000000000000000,
      chain_id: 5000,
      reward_type: 'ERC20',
      marketplace_url: 'https://test.com'
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
  quest_external_game: {
    store_redirect_url: 'https://hyperplay.xyz/game/craft-world',
    runner: {
      name: 'Craft World',
      steam_app_id: '123456',
      store_redirect_url: 'https://hyperplay.xyz/game/craft-world'
    }
  },
  num_of_times_repeatable: 10
}

const mockProps: QuestDetailsWrapperProps = {
  selectedQuestId: 1,
  getExternalEligibility: async () => {
    return null
  },
  getActiveWallet: async () => {
    return null
  },
  setActiveWallet: async () => {
    return { success: true, status: 200 }
  },
  onRewardClaimed: () => {
    alert('This is when we show the claim success modal')
  },
  flags: {
    rewardTypeClaimEnabled: {
      ERC20: true,
      ERC721: true,
      ERC1155: true,
      POINTS: true,
      'EXTERNAL-TASKS': true
    },
    questsOverlayClaimCtaEnabled: false,
    gameplayWalletSectionVisible: true
  },
  onPlayClick: () => alert('onPlayClick'),
  getQuest: async () => {
    return mockQuest
  },
  getGameplayWallets: async () => {
    return []
  },
  updateActiveWallet: async () => {
    return Promise.resolve()
  },
  getUserPlayStreak: async () => {
    return {
      current_playstreak_in_days: 0,
      completed_counter: 0,
      accumulated_playtime_today_in_seconds: 0,
      last_play_session_completed_datetime: ''
    }
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
  },
  getActiveWalletSignature: async () => {
    return {
      message: '0',
      signature: '0'
    }
  }
}

const meta: Meta<typeof RewardsBanner> = {
  component: RewardsBanner,
  title: 'Components/RewardsBanner',
  decorators: [createQueryClientDecorator],
  args: {
    quest: mockQuest
  },
  render: (args) => {
    return (
      <QuestWrapperProvider {...mockProps}>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export default meta

type Story = StoryObj<typeof RewardsBanner>

export const NotSignedIn: Story = {
  render: (args) => {
    return (
      <QuestWrapperProvider {...mockProps} isSignedIn={false}>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export const InProgressQuest: Story = {
  args: {
}
}

export const InWaitPeriod: Story = {
  args: {
    quest: {
      ...mockQuest,
      end_date: dayjs().subtract(7, 'days').toISOString()
    }
  },
  render: (args) => {
    return (
      <QuestWrapperProvider {...mockProps}>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export const InClaimPeriodAndNotEligible: Story = {
  args: {
    quest: {
      ...mockQuest,
      status: 'CLAIMABLE',
      end_date: dayjs().subtract(7, 'days').toISOString()
    }
  },
  render: (args) => {
    return (
      <QuestWrapperProvider {...mockProps}>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}
