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
  trackEvent,
  getActiveWallet,
  getGameplayWallets,
  updateActiveWallet
}: {
  trackEvent: QuestWrapperContextValue['trackEvent']
  setActiveWallet?: QuestWrapperContextValue['setActiveWallet']
  getActiveWallet?: QuestWrapperContextValue['getActiveWallet']
  getGameplayWallets?: QuestWrapperContextValue['getGameplayWallets']
  updateActiveWallet?: QuestWrapperContextValue['updateActiveWallet']
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
      trackEvent={trackEvent}
      {...(setActiveWallet && { setActiveWallet })}
      {...(getActiveWallet && { getActiveWallet })}
      {...(getGameplayWallets && { getGameplayWallets })}
      {...(updateActiveWallet && { updateActiveWallet })}
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
      event: 'Add Gameplay Wallet Rejected',
      properties: {
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })
  })

  it('Handles wallet already linked', async () => {
    const setActiveWalletMock = vi.fn().mockResolvedValue(
      Promise.resolve({
        success: false,
        status: 409,
        message: 'Wallet already linked'
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
      expect(screen.getByText('Wallet Already Linked')).toBeInTheDocument()
    })

    expect(setActiveWalletMock).toHaveBeenCalled()

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
        error: expect.stringContaining(
          'Wallet already linked to another account'
        ),
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })
  })

  it('Handles switching wallet', async () => {
    const setActiveWalletMock = vi.fn().mockResolvedValue(
      Promise.resolve({
        success: true,
        status: 200
      })
    )

    const updateActiveWalletMock = vi.fn().mockResolvedValue(
      Promise.resolve({
        success: true,
        status: 200
      })
    )

    const trackEventMock = vi.fn()

    const getActiveWalletMock = vi
      .fn()
      .mockResolvedValue(
        Promise.resolve('0x5a241425BF9AAA8503af0CE1Ec30651c30AeACB8')
      )

    const getGameplayWalletsMock = vi
      .fn()
      .mockResolvedValue(
        Promise.resolve([{ id: 1, wallet_address: walletAddress }])
      )

    render(
      <TestWrapper
        setActiveWallet={setActiveWalletMock}
        updateActiveWallet={updateActiveWalletMock}
        trackEvent={trackEventMock}
        getActiveWallet={getActiveWalletMock}
        getGameplayWallets={getGameplayWalletsMock}
      />
    )

    await waitForWalletToConnect()

    await waitFor(() => {
      expect(screen.getByText('Connected Wallet')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Set as Active' }))

    await waitFor(() => {
      expect(screen.getByText('Active Wallet')).toBeInTheDocument()
    })

    expect(updateActiveWalletMock).toHaveBeenCalled()

    expect(setActiveWalletMock).not.toHaveBeenCalled()

    expect(trackEventMock).toHaveBeenCalledTimes(2)

    expect(trackEventMock).toHaveBeenNthCalledWith(1, {
      event: 'Update Active Wallet Start',
      properties: {
        walletId: 1,
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })

    expect(trackEventMock).toHaveBeenNthCalledWith(2, {
      event: 'Update Active Wallet Success',
      properties: {
        walletAddress,
        walletId: 1,
        walletConnector: 'Mock Connector'
      }
    })
  })

  it('Handles switching wallet error', async () => {
    const updateActiveWalletMock = vi
      .fn()
      .mockRejectedValue(new Error('Server Error'))

    const trackEventMock = vi.fn()

    const getActiveWalletMock = vi
      .fn()
      .mockResolvedValue(
        Promise.resolve('0x5a241425BF9AAA8503af0CE1Ec30651c30AeACB8')
      )

    const getGameplayWalletsMock = vi
      .fn()
      .mockResolvedValue(
        Promise.resolve([{ id: 1, wallet_address: walletAddress }])
      )

    render(
      <TestWrapper
        updateActiveWallet={updateActiveWalletMock}
        trackEvent={trackEventMock}
        getActiveWallet={getActiveWalletMock}
        getGameplayWallets={getGameplayWalletsMock}
      />
    )

    await waitForWalletToConnect()

    await waitFor(() => {
      expect(screen.getByText('Connected Wallet')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Set as Active' }))

    await waitFor(() => {
      expect(updateActiveWalletMock).toHaveBeenCalled()
    })

    expect(trackEventMock).toHaveBeenCalledTimes(2)

    expect(trackEventMock).toHaveBeenNthCalledWith(1, {
      event: 'Update Active Wallet Start',
      properties: {
        walletId: 1,
        walletAddress,
        walletConnector: 'Mock Connector'
      }
    })

    expect(trackEventMock).toHaveBeenNthCalledWith(2, {
      event: 'Update Active Wallet Error',
      properties: {
        error: expect.stringContaining('Server Error'),
        walletAddress,
        walletId: 1,
        walletConnector: 'Mock Connector'
      }
    })
  })
})
