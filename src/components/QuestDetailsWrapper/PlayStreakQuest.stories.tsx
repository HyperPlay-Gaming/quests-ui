import type { Meta, StoryObj } from '@storybook/react'
import { QuestDetailsWrapper, QuestDetailsWrapperProps } from './index'
import styles from './story-styles.module.scss'
import { Quest, UserPlayStreak } from '@hyperplay/utils'
import { useState } from 'react'
import { verifyMessage, BrowserProvider } from 'ethers'
import { generateNonce, SiweMessage } from 'siwe'
import { useAccount } from 'wagmi'
import { within, expect, waitFor, fn } from '@storybook/test'
import { createQueryClientDecorator } from '@/helpers/createQueryClientDecorator'
import { waitForLoadingSpinnerToDisappear } from '@/utils/storybook/quest-wrapper'
import { InjectedProviderMock } from '@/mocks/injectedProvider'

const meta: Meta<typeof QuestDetailsWrapper> = {
  component: QuestDetailsWrapper,
  title: 'Components/QuestDetailsWrapper/PlayStreak',
  decorators: [createQueryClientDecorator],
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

const mockQuest: Quest = {
  id: 1,
  end_date: null,
  start_date: null,
  leaderboard_url: null,
  project_id:
    '0x36484d1723bba04a21430c5b50fc62737e4eca581cd806a36665a931e20d6f06',
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
      marketplace_url: 'https://hyperplay.xyz'
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
      marketplace_url: 'https://hyperplay.xyz',
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

const eligibleUserPlayStreak: UserPlayStreak = {
  current_playstreak_in_days: 5,
  completed_counter: 0,
  accumulated_playtime_today_in_seconds: 1000,
  last_play_session_completed_datetime: '2024-01-01T00:00:00Z'
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
  getExternalEligibility: async () => {
    return null
  },
  getActiveWallet: async () => {
    return null
  },
  setActiveWallet: async (wallet) => {
    alert(`setActiveWallet ${wallet}`)
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
    return mockUserPlayStreak
  },
  getSteamGameMetadata: async () => {
    return {
      id: '1',
      name: 'Test Game',
      capsule_image: 'https://hyperplay.xyz/image.png'
    }
  },
  isSignedIn: true,
  trackEvent: () => {},
  signInWithSteamAccount: () => {},
  openSignInModal: () => alert('openSignInModal'),
  logError: (...msg) => {
    console.error('handling error with logError prop: ', ...msg)
  },
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
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: signer.address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: generateNonce()
      })

      const message = siweMessage.prepareMessage()

      const signature = await signer.signMessage(message)

      return {
        message,
        signature
      }
    } catch (error) {
      console.error('Error getting active wallet signature', error)
      throw error
    }
  }
}

export const QuestPageNotSignedIn: Story = {
  args: {
    ...mockProps,
    isSignedIn: false,
    isQuestsPage: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    expect(
      canvas.getByText('Log into HyperPlay to track quest eligibility')
    ).toBeVisible()
    expect(canvas.getByRole('button', { name: /play/i })).toBeDisabled()
    canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
      expect(button).toBeDisabled()
    })
  }
}

export const QuestPageSignedIn: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    expect(
      canvas.queryByText('Log into HyperPlay to track quest eligibility')
    ).not.toBeInTheDocument()
    canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
      expect(button).toBeDisabled()
    })
  }
}

export const QuestPageSignedInNoActiveWallet: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    expect(
      canvas.getByText(
        'Connect your wallet to start tracking eligibility for this Quest.'
      )
    ).toBeVisible()
    expect(canvas.getByRole('button', { name: /play/i })).toBeDisabled()
    canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
      expect(button).toBeDisabled()
    })
  }
}

export const QuestPageSignedInWithActiveWallet: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true,
    getActiveWallet: async () => {
      return '0x123'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitForLoadingSpinnerToDisappear(canvas)

    await waitFor(() => {
      expect(canvas.queryByText('0x123')).toBeInTheDocument()
    })

    expect(canvas.getByRole('button', { name: /play/i })).toBeEnabled()
    canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
      expect(button).toBeDisabled()
    })
  }
}

export const QuestPageSignedInEligible: Story = {
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true,
    getActiveWallet: async () => {
      return '0x123'
    },
    getUserPlayStreak: async () => {
      return eligibleUserPlayStreak
    },
    checkG7ConnectionStatus: async () => {
      return true
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)

    // await for the claim button to be enabled
    await waitFor(() => {
      canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
        expect(button).toBeEnabled()
      })
    })
  }
}

export const QuestPageSignedInEligibleNoActiveWalletRequired: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    ...mockProps,
    isQuestsPage: true,
    isSignedIn: true,
    flags: { ...mockProps.flags, gameplayWalletSectionVisible: false },
    getActiveWallet: async () => {
      return null
    },
    getUserPlayStreak: async () => {
      return eligibleUserPlayStreak
    },
    checkG7ConnectionStatus: async () => {
      return true
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)

    // await for the claim button to be enabled
    await waitFor(() => {
      canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
        expect(button).toBeEnabled()
      })
    })
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
    getActiveWallet: async () => {
      return '0x123'
    },
    getUserPlayStreak: async () => {
      return eligibleUserPlayStreak
    },
    checkG7ConnectionStatus: async () => {
      return true
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    await waitFor(() => {
      canvas.getAllByRole('button', { name: /claim/i }).forEach((button) => {
        expect(button).toBeEnabled()
      })
    })
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

export const ActiveWalletSectionNotVisible: Story = {
  args: {
    ...mockProps,
    flags: { ...mockProps.flags, gameplayWalletSectionVisible: false }
  }
}

export const ActiveWalletNotSignedIn: Story = {
  args: {
    ...mockProps,
    isSignedIn: false
  }
}

export const ActiveWalletConnectDefault: Story = {
  args: {
    ...mockProps
  },
  render: (args) => {
    const [activeWallet, setActiveWallet] = useState<string | null>(null)
    return (
      <QuestDetailsWrapper
        {...args}
        getActiveWallet={async () => Promise.resolve(activeWallet)}
        setActiveWallet={async ({ message, signature }) => {
          const wallet = verifyMessage(message, signature)
          setActiveWallet(wallet)
          // wait for wallet state to be updated so that the query is invalidated (this is only because we're mocking a remote state with a local react state)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: true, status: 200 }
        }}
      />
    )
  }
}

export const ActiveWalletSwitchWallet: Story = {
  args: {
    ...mockProps
  },
  render: (args) => {
    const [activeWallet, setActiveWallet] = useState<string | null>(
      '0x5a241425BF9AAA8503af0CE1Ec30651c30AeACB8'
    )
    return (
      <QuestDetailsWrapper
        {...args}
        getActiveWallet={async () => Promise.resolve(activeWallet)}
        setActiveWallet={async ({ message, signature }) => {
          const wallet = verifyMessage(message, signature)
          setActiveWallet(wallet)
          // wait for wallet state to be updated so that the query is invalidated (this is only because we're mocking a remote state with a local react state)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: true, status: 200 }
        }}
      />
    )
  }
}

export const ActiveWalletSwitchWalletAlreadyLinked: Story = {
  args: {
    ...mockProps
  },
  render: (args) => {
    const { addresses, address } = useAccount()
    const [activeWallet, setActiveWallet] = useState<string | null>()
    return (
      <QuestDetailsWrapper
        key={address}
        {...args}
        getGameplayWallets={async () =>
          addresses?.map((address, index) => ({
            id: index,
            wallet_address: address
          })) ?? []
        }
        getActiveWallet={async () => Promise.resolve(activeWallet)}
        updateActiveWallet={async () => {
          setActiveWallet(address)
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }}
        setActiveWallet={async ({ message, signature }) => {
          const wallet = verifyMessage(message, signature)
          setActiveWallet(wallet)
          // wait for wallet state to be updated so that the query is invalidated (this is only because we're mocking a remote state with a local react state)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: true, status: 200 }
        }}
      />
    )
  }
}

export const ActiveWalletSwitchWalletError: Story = {
  args: {
    ...mockProps
  },
  render: (args) => {
    return (
      <QuestDetailsWrapper
        {...args}
        setActiveWallet={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: false, status: 500, message: 'Error' }
        }}
      />
    )
  }
}

export const ActiveWalletSwitchWalletAlreadyLinkedToAnotherAccount: Story = {
  args: {
    ...mockProps
  },
  render: (args) => {
    return (
      <QuestDetailsWrapper
        {...args}
        setActiveWallet={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return {
            success: false,
            status: 409,
            message: 'Wallet already linked'
          }
        }}
      />
    )
  }
}

export const ActiveWalletSwitchWalletExistingWalletSkipSignature: Story = {
  args: {
    ...mockProps
  },
  render: (args) => {
    const [activeWallet, setActiveWallet] = useState<string | null>(null)
    const { address } = useAccount()
    console.log('activeWallet', activeWallet)
    return (
      <QuestDetailsWrapper
        key={address}
        {...args}
        getActiveWallet={async () => Promise.resolve(activeWallet)}
        getGameplayWallets={async () => [
          { id: 1, wallet_address: address ?? '' }
        ]}
        updateActiveWallet={async () => {
          console.log('updateActiveWallet', address)
          setActiveWallet(address ?? '')
        }}
      />
    )
  }
}

const windowEth = new InjectedProviderMock()

const logErrorMock = fn()
const trackEventMock = fn()

export const TestSwitchToChainNoEIP3085: Story = {
  args: {
    ...mockProps
  },
  decorators: [
    (Story) => {
      window.ethereum = windowEth
      return <Story />
    }
  ],
  render: (args) => {
    const activeWallet = window.ethereum.address
    const { address } = useAccount()
    return (
      <QuestDetailsWrapper
        {...args}
        getActiveWallet={async () => Promise.resolve(activeWallet)}
        getGameplayWallets={async () => [
          { id: 1, wallet_address: address ?? '' }
        ]}
        updateActiveWallet={async () => {
          console.log('updateActiveWallet', address)
        }}
        getUserPlayStreak={async (): Promise<UserPlayStreak> => {
          return {
            current_playstreak_in_days: 5,
            completed_counter: 3,
            accumulated_playtime_today_in_seconds: 1800,
            last_play_session_completed_datetime: new Date().toISOString()
          }
        }}
        logError={(...args) => {
          console.error('quest log error: ', ...args)
          logErrorMock(...args)
        }}
        getQuest={async () => {
          const mockQuestOneApeChainReward: Quest = {
            ...mockQuest,
            rewards: [
              {
                id: 1,
                name: 'Some ApeChain Reward',
                contract_address: '0xb85Df74eB6db8C2D87c3bD7d4Ee1A27929643dA3',
                decimals: 18,
                image_url:
                  'https://gateway.valist.io/ipfs/bafkreicwp22quggyljn3b4km2we2asaq256yyfa2qyxrapu7qnuasbbnrq',
                token_ids: [],
                numClaimsLeft: '2357',
                amount_per_user: 200000000000000000000000,
                chain_id: 33139,
                reward_type: 'ERC20',
                marketplace_url: 'https://hyperplay.xyz'
              }
            ]
          }
          return mockQuestOneApeChainReward
        }}
        trackEvent={(...args) => {
          console.log('tracking this event ', ...args)
          trackEventMock(...args)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForLoadingSpinnerToDisappear(canvas)
    const claimButton = canvas.getByRole('button', { name: /Claim/i })
    claimButton.click()
    const confirmButton = canvas.getByRole('button', { name: /Confirm/i })
    confirmButton.click()
    await waitFor(async () => expect(logErrorMock).toBeCalled())
    await waitFor(() => {
      canvas.findByText(
        'Please switch to ApeChain within your wallet, or try again with MetaMask.'
      )
    })
    const rewardClaimErrorTrackObject =
      trackEventMock.mock.calls[trackEventMock.mock.calls.length - 1][0]
    expect(rewardClaimErrorTrackObject.properties).toHaveProperty(
      'errorName',
      'SwitchChainError'
    )
    expect(rewardClaimErrorTrackObject.properties).toHaveProperty(
      'errorCode',
      4902
    )
  }
}
