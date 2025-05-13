import { describe, it, vi } from 'vitest'
import { QuestWrapperContextValue, UseGetRewardsData } from '@/types/quests'
import {
  mockQuest as defaultMockQuest,
  QuestWrapperTestProvider,
  render,
  setupMockWalletConfig,
  waitForWalletToConnect,
  fireEvent,
  screen,
  waitFor,
  walletAddress
} from '@/tests'
import { RewardWrapper } from '.'

const mockQuest = {
  ...defaultMockQuest,
  status: 'CLAIMABLE' as const
}

const mockReward: UseGetRewardsData = {
  id: 1,
  name: 'Some ApeChain Reward',
  image_url: 'https://test.com/image.png',
  reward_type: 'ERC20',
  contract_address: '0x123',
  decimals: 18,
  token_ids: [],
  amount_per_user: 100,
  chain_id: 33139,
  marketplace_url: 'https://test.com/marketplace',
  title: 'Test Reward',
  imageUrl: 'https://test.com/image.png',
  chainName: 'Test Chain',
  numClaimsLeft: '100'
}

function TestWrapper({
  trackEvent
}: {
  trackEvent: QuestWrapperContextValue['trackEvent']
}) {
  return (
    <QuestWrapperTestProvider
      trackEvent={trackEvent}
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
      <RewardWrapper reward={mockReward} questId={1} questMeta={mockQuest} />
    </QuestWrapperTestProvider>
  )
}

describe('RewardWrapper', () => {
  it('should handle switch chain error', async () => {
    const trackEventMock = vi.fn()

    render(<TestWrapper trackEvent={trackEventMock} />, {
      wagmiConfig: setupMockWalletConfig({
        features: {
          switchChainError: true
        }
      })
    })

    await waitForWalletToConnect()

    fireEvent.click(screen.getByRole('button', { name: 'Claim' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalled()
    })

    expect(screen.getByText('Please switch to ApeChain within your wallet, or try again with MetaMask.'))

    expect(trackEventMock).toHaveBeenCalledTimes(2)

    expect(trackEventMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        event: 'Reward Claim Started'
      })
    )

    expect(trackEventMock).toHaveBeenNthCalledWith(2, {
      event: 'Reward Claim Error',
      properties: expect.objectContaining({
        errorName: 'SwitchChainError',
        errorCode: 4902,
        errorShortMessage: 'An error occurred when attempting to switch chain.',
        errorDetails: expect.stringContaining('Chain not configured')
      })
    })
  })
})
