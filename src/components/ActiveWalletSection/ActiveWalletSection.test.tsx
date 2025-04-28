import { describe, it, vi } from 'vitest'
import {
  render,
  waitFor,
  screen,
  fireEvent,
  waitForWalletToConnect,
  walletAddress,
  QuestWrapperTestProvider,
  setupMockWalletConfig
} from '@/tests'
import ActiveWalletSection from '../ActiveWalletSection'
import { useSignMessage } from 'wagmi'
import { QuestWrapperContextValue } from '@/types/quests'

function TestWrapper({
  setActiveWallet,
  trackEvent
}: {
  setActiveWallet: QuestWrapperContextValue['setActiveWallet']
  trackEvent: QuestWrapperContextValue['trackEvent']
}) {
  const { signMessageAsync } = useSignMessage()
  const getActiveWalletSignature = async () => {
    const message = 'Test Message'
    const signature = await signMessageAsync({
      message
    })
    return { message, signature }
  }
  return (
    <QuestWrapperTestProvider
      getActiveWalletSignature={getActiveWalletSignature}
      setActiveWallet={setActiveWallet}
      trackEvent={trackEvent}
    >
      <ActiveWalletSection />
    </QuestWrapperTestProvider>
  )
}

describe('ActiveWalletSection', () => {
  it('Can set active wallet', async () => {
    const setActiveWalletMock = vi.fn().mockResolvedValue(
      Promise.resolve({
        success: true,
        status: 200
      })
    )

    const trackEventMock = vi.fn()

    render(
      <TestWrapper
        setActiveWallet={setActiveWalletMock}
        trackEvent={trackEventMock}
      />
    )

    await waitForWalletToConnect()

    fireEvent.click(screen.getByRole('button', { name: 'Set as Active' }))

    await waitFor(() => {
      expect(setActiveWalletMock).toHaveBeenCalled()
    })

    expect(trackEventMock).toHaveBeenCalledTimes(2)

    expect(trackEventMock).toHaveBeenNthCalledWith(1, {
      event: 'Add Gameplay Wallet Start',
      properties: {
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })

    expect(trackEventMock).toHaveBeenNthCalledWith(2, {
      event: 'Add Gameplay Wallet Success',
      properties: {
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })
  })

  it('Handles rejected set active wallet', async () => {
    const setActiveWalletMock = vi.fn().mockResolvedValue(
      Promise.resolve({
        success: true,
        status: 200
      })
    )

    const trackEventMock = vi.fn()

    render(
      <TestWrapper
        setActiveWallet={setActiveWalletMock}
        trackEvent={trackEventMock}
      />,
      {
        wagmiConfig: setupMockWalletConfig({
          features: {
            signMessageError: true
          }
        })
      }
    )

    await waitForWalletToConnect()

    fireEvent.click(screen.getByRole('button', { name: 'Set as Active' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    expect(setActiveWalletMock).not.toHaveBeenCalled()

    expect(trackEventMock).toHaveBeenCalledTimes(2)

    expect(trackEventMock).toHaveBeenNthCalledWith(1, {
      event: 'Add Gameplay Wallet Start',
      properties: {
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })

    expect(trackEventMock).toHaveBeenNthCalledWith(2, {
      event: 'Add Gameplay Wallet Error',
      properties: {
        error: expect.stringContaining('User rejected the request'),
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })
  })
})
