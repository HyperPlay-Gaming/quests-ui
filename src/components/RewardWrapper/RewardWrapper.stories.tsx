import type { Meta, StoryObj } from '@storybook/react'
import { RewardWrapper } from '.'
import { QuestWrapperContextValue, UseGetRewardsData } from '@/types/quests'
import { QuestWrapperProvider } from '@/state/QuestWrapperProvider'
import dayjs from 'dayjs'
import { createQueryClientDecorator } from '@/helpers/createQueryClientDecorator'
type Story = StoryObj<typeof RewardWrapper>

const chainId = 31337

const rewardContractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'

const mockSignature = {
  signature:
    '0x09d1081d03d6b2e9f5f89e151340db765330e6dfbe652c91c27455aec2331a9e01bcfca6c36f071055c947ce367945a01617d5048ec819faddecb65c1b323fb61c',
  nonce: '0x4608a929cb7b99f5cbe8dfd264aab9ff',
  expiration: 1747327435,
}

const mockQuest = {
  id: 1,
  leaderboard_url: 'https://hyperplay.xyz',
  end_date: dayjs().add(1, 'year').toISOString(),
  start_date: null,
  project_id:
    '0x36484d1723bba04a21430c5b50fc62737e4eca581cd806a36665a931e20d6f06',
  name: "🦖 Craft World's Ultimate Play Streak Quest 🔥 🚀",
  type: 'LEADERBOARD' as const,
  status: 'CLAIMABLE' as const,
  description: `Embrace the Ultimate Play Streak Quest by Craft World! 🎮 Play daily to earn rewards, contribute to the Masterpiece, and climb the leaderboard. 🏆
    
    👉 Quest: Play 5+ minutes/day for 7 consecutive days within our 30-day campaign.
    💰 Rewards: 200,000 in-game Dyno Coins and Game7 Credits! Dyno Coins are THE in-game currency for resources.
    
    Rise among Craft World's top ranks. 🚀 Join now and make your mark before the masterpiece is completed! 🔥🎮`,
  rewards: [
    {
      id: 1,
      name: '$MNT',
      contract_address:
        '0xb85Df74eB6db8C2D87c3bD7d4Ee1A27929643dA3' as `0x${string}`,
      decimals: 18,
      image_url: '/images/mantle-icon.png',
      token_ids: [],
      numClaimsLeft: '2357',
      amount_per_user: 2000000000000000000000,
      chain_id: 5000,
      reward_type: 'ERC20' as const,
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

const defaultQuestProviderProps: QuestWrapperContextValue = {
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
      signature: mockSignature.signature as `0x${string}`,
      nonce: mockSignature.nonce,
      expiration: mockSignature.expiration,
      tokenIds: [0]
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
    return [
      {
        contract_address: rewardContractAddress as `0x${string}`,
        chain_id: chainId
      }
    ]
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

const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

const mockReward: UseGetRewardsData = {
  id: 1,
  name: 'Anvil Reward',
  image_url: 'https://test.com/image.png',
  reward_type: 'ERC20',
  contract_address: rewardContractAddress as `0x${string}`,
  decimals: 18,
  token_ids: [],
  amount_per_user: 1,
  chain_id: chainId,
  marketplace_url: 'https://test.com/marketplace',
  title: 'Test Reward',
  imageUrl: 'https://test.com/image.png',
  chainName: 'Test Chain',
  numClaimsLeft: '100'
}

const meta: Meta<typeof RewardWrapper> = {
  component: RewardWrapper,
  title: 'Components/RewardWrapper',
  decorators: [createQueryClientDecorator],
  args: {
    reward: mockReward,
    questId: 1,
    questMeta: mockQuest
  },
  render: (args) => {
    return (
      <QuestWrapperProvider
        {...defaultQuestProviderProps}
        getActiveWallet={async () => Promise.resolve(walletAddress)}
        getGameplayWallets={async () => [
          { id: 1, wallet_address: walletAddress }
        ]}
        updateActiveWallet={async () => {
          console.log('updateActiveWallet')
        }}
        getExternalEligibility={async () =>
          Promise.resolve({
            amount: 100,
            walletOrEmail: walletAddress
          })
        }
      >
        <div style={{ backgroundColor: 'black', padding: '20px' }}>
          <RewardWrapper {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export default meta

export const Default: Story = {}
