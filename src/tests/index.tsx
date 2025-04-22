import { RenderOptions, render } from '@testing-library/react'
import { default as userEvent } from '@testing-library/user-event'
import * as React from 'react'

import { createConfig, WagmiProvider, WagmiProviderProps } from 'wagmi'
import { mock } from 'wagmi/connectors'

import { http } from 'viem'
import { foundry } from 'viem/chains'
import dayjs from 'dayjs'
import { QuestWrapperProvider } from '@/state/QuestWrapperProvider'
import { QuestWrapperContextValue } from '@/types/quests'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HyperPlayDesignProvider } from '@hyperplay/ui'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'

export function setupConfig() {
  return createConfig({
    chains: [foundry],
    connectors: [
      mock({
        accounts: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
      })
    ],
    transports: {
      [foundry.id]: http(foundry.rpcUrls.default.http[0])
    }
  })
}

type ProvidersProps = {
  children: React.ReactNode
  config?: WagmiProviderProps['config']
}

const queryClient = new QueryClient()

export function Providers({
  children,
  config = setupConfig()
}: ProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <HyperPlayDesignProvider>
            <QuestWrapperProvider {...questProviderProps}>
              {children}
            </QuestWrapperProvider>
          </HyperPlayDesignProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </I18nextProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: RenderOptions
): ReturnType<typeof render> => render(ui, { wrapper: Providers, ...options })

export * from '@testing-library/react'
export { customRender as render }

export type UserEvent = ReturnType<typeof userEvent.setup>
export { default as userEvent } from '@testing-library/user-event'

export const mockQuest = {
  id: 1,
  leaderboard_url: 'https://hyperplay.xyz',
  end_date: dayjs().add(1, 'year').toISOString(),
  start_date: null,
  project_id:
    '0x36484d1723bba04a21430c5b50fc62737e4eca581cd806a36665a931e20d6f06',
  name: "🦖 Craft World's Ultimate Play Streak Quest 🔥 🚀",
  type: 'LEADERBOARD' as const,
  status: 'ACTIVE' as const,
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

export const questProviderProps: QuestWrapperContextValue = {
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
