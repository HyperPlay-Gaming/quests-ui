import { describe, it } from 'vitest'
import { render, mockQuest, waitFor, screen, fireEvent } from '@/tests'
import { RewardWrapper } from './'
import { Connect } from '../Connect'

const reward = {
  ...mockQuest.rewards[0],
  title: 'Test Reward',
  imageUrl: 'https://test.com/image.png',
  chainName: 'Test Chain'
}

const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

describe('RewardWrapper', () => {
  it('renders', async () => {
    render(
      <>
        <Connect />
        <RewardWrapper reward={reward} questId={mockQuest.id} questMeta={mockQuest} />
      </>
    )
    const button = screen.getByRole('button', { name: 'Mock Connector' })
    await waitFor(() => {
      expect(button).toBeEnabled()
    })
    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByText(address)).toBeInTheDocument()
    })
    screen.debug()
  })
})
