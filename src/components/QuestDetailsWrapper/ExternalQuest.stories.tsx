import { Quest } from '@hyperplay/utils'
import type { Meta, StoryObj } from '@storybook/react'
import { QuestDetailsWrapper, QuestDetailsWrapperProps } from './index'
import { createQueryClientDecorator } from '@/helpers/createQueryClientDecorator'
import styles from './story-styles.module.scss'
import dayjs from 'dayjs'
import { waitForLoadingSpinnerToDisappear } from '@/utils/storybook/quest-wrapper'
import { within, expect, waitFor } from '@storybook/test'

const mockQuest: Quest = {
  id: 1,
  leaderboard_url: 'https://hyperplay.xyz',
  end_date: dayjs().add(1, 'year').toISOString(),
  start_date: null,
  project_id:
    '0x36484d1723bba04a21430c5b50fc62737e4eca581cd806a36665a931e20d6f06',
  name: "🦖 Craft World's Ultimate Play Streak Quest 🔥 🚀",
  type: 'LEADERBOARD',
  status: 'ACTIVE',
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
  className: styles.root,
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

const meta: Meta<typeof QuestDetailsWrapper> = {
  component: QuestDetailsWrapper,
  title: 'Components/QuestDetailsWrapper/Leaderboard',
  decorators: [createQueryClientDecorator],
  args: mockProps,
  render: (args) => {
    return (
      <div style={{ height: 'calc(100vh - 100px)' }}>
        {<QuestDetailsWrapper {...args} />}
      </div>
    )
  }
}

export default meta

type Story = StoryObj<typeof QuestDetailsWrapper>

export const NotSignedIn: Story = {
  args: {
    ...mockProps,
    isSignedIn: false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    expect(
      canvas.getByText('Log into HyperPlay to track quest eligibility')
    ).toBeInTheDocument()
    expect(canvas.queryByRole('button', { name: 'Claim' })).toBeDisabled()
  }
}

export const InProgressQuest: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    expect(canvas.queryByRole('button', { name: 'Claim' })).toBeDisabled()
  }
}

export const InWaitPeriod: Story = {
  args: {
    ...mockProps,
    getQuest: async () => {
      return {
        ...mockQuest,
        end_date: dayjs().subtract(7, 'days').toISOString()
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    await waitFor(() => {
      expect(
        canvas.getByText(
          "Thanks for participating! The game studio is finalizing results. You'll be notified when you're able to claim your reward here.*"
        )
      ).toBeInTheDocument()
    })
    expect(canvas.queryByRole('button', { name: 'Claim' })).toBeDisabled()
  }
}

export const InClaimPeriodAndNotEligible: Story = {
  args: {
    ...mockProps,
    getQuest: async () => {
      return {
        ...mockQuest,
        status: 'CLAIMABLE',
        end_date: dayjs().subtract(7, 'days').toISOString()
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    await waitFor(() => {
      expect(
        canvas.getByText("You didn't qualify for a reward")
      ).toBeInTheDocument()
    })
    expect(canvas.queryByRole('button', { name: 'Claim' })).toBeDisabled()
  }
}

export const InClaimPeriodAndEligible: Story = {
  args: {
    ...mockProps,
    getQuest: async () => {
      return {
        ...mockQuest,
        status: 'CLAIMABLE',
        end_date: dayjs().subtract(7, 'days').toISOString()
      }
    },
    getExternalEligibility: async () => {
      return {
        walletOrEmail: '0x123',
        amount: 100
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    await waitFor(() => {
      expect(
        canvas.getByText(
          "You qualified for a Reward! The game studio has finalized results and you're eligible—claim your reward below.*"
        )
      ).toBeInTheDocument()
    })
    expect(canvas.getByRole('button', { name: 'Claim' })).toBeEnabled()
  }
}
