import { describe, it } from 'vitest'
import { render, mockQuest } from '@/tests'
import { RewardWrapper } from './'

const reward = {
  ...mockQuest.rewards[0],
  title: 'Test Reward',
  imageUrl: 'https://test.com/image.png',
  chainName: 'Test Chain'
}

describe('RewardWrapper', () => {
  it('renders', () => {
    const { container } = render(
      <RewardWrapper
        reward={reward}
        questId={mockQuest.id}
        questMeta={mockQuest}
      />
    )
    expect(container).toBeInTheDocument()
  })
})
