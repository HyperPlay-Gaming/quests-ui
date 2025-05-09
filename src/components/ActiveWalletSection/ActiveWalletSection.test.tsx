import { describe, it, vi } from 'vitest'
import {
  render,
  waitFor,
  screen,
  fireEvent,
  waitForWalletToConnect,
  QuestWrapperTestProvider
} from '@/tests'
import ActiveWalletSection from '../ActiveWalletSection'
import { useSignMessage } from 'wagmi'
import { QuestWrapperContextValue } from '@/types/quests'

function CanSetActiveWallet({
  setActiveWallet
}: {
  setActiveWallet: QuestWrapperContextValue['setActiveWallet']
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

    render(<CanSetActiveWallet setActiveWallet={setActiveWalletMock} />)

    await waitForWalletToConnect()

    fireEvent.click(screen.getByRole('button', { name: 'Set as Active' }))

    await waitFor(() => {
      expect(setActiveWalletMock).toHaveBeenCalled()
    })
  })
})
