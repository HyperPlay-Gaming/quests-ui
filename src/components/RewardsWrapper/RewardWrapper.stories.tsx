import { Meta, StoryFn, StoryContext, StoryObj } from '@storybook/react'
import { RewardsWrapper } from './'
import { createQueryClientDecorator } from '@/helpers/createQueryClientDecorator'
import {
  createQuestWrapperDecorator,
  defaultQuestWrapperProps,
  mockQuest
} from '@/helpers/createQuestWrapperDecorator'
import { Quest } from '@hyperplay/utils'
import {
  within,
  expect,
  waitForElementToBeRemoved,
  waitFor
} from '@storybook/test'

const mockReward: Quest['rewards'] = [
  {
    id: 1,
    name: 'MNT',
    contract_address: '0xb85Df74eB6db8C2D87c3bD7d4Ee1A27929643dA3',
    decimals: 18,
    image_url: '/images/mantle-icon.png',
    token_ids: [],
    numClaimsLeft: '1000',
    amount_per_user: 200000000000000000000000,
    chain_id: 5000,
    reward_type: 'ERC20',
    marketplace_url: 'https://hyperplay.xyz',
    num_claims_per_device: ''
  }
]

const meta: Meta<typeof RewardsWrapper> = {
  title: 'Components/RewardsWrapper',
  component: RewardsWrapper,
  decorators: [
    createQueryClientDecorator,
    (Story: StoryFn, context: StoryContext) => {
      return (
        <div style={{ padding: '20px', background: 'black', borderRadius: 8 }}>
          <Story {...context.args} />
        </div>
      )
    }
  ],
  args: {
    questId: mockQuest.id
  }
}

export default meta

type Story = StoryObj<typeof RewardsWrapper>

export const PlayStreakQuest: Story = {
  decorators: [
    createQuestWrapperDecorator({
      getQuest: async () => {
        return {
          ...mockQuest,
          rewards: mockReward
        }
      }
    })
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForElementToBeRemoved(() =>
      canvas.getByLabelText('loading rewards')
    )
    expect(canvas.getByText('+200 K MNT')).toBeInTheDocument()
  }
}

export const LeaderboardQuestNotEligible: Story = {
  decorators: [
    createQuestWrapperDecorator({
      getQuest: async () => {
        return {
          ...mockQuest,
          type: 'LEADERBOARD',
          rewards: mockReward
        }
      }
    })
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForElementToBeRemoved(() =>
      canvas.getByLabelText('loading rewards')
    )
    expect(canvas.queryByText('+200 K MNT')).not.toBeInTheDocument()
  }
}

export const LeaderboardQuestEligible: Story = {
  decorators: [
    createQuestWrapperDecorator({
      getExternalEligibility: async () => {
        return {
          walletOrEmail: '0x123',
          amount: '100000000000000000000',
          questId: mockQuest.id
        }
      },
      getActiveWallet: async () => {
        return '0x123'
      },
      getQuest: async () => {
        return {
          ...mockQuest,
          status: 'CLAIMABLE',
          type: 'LEADERBOARD',
          rewards: mockReward
        }
      }
    })
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForElementToBeRemoved(() =>
      canvas.getByLabelText('loading rewards')
    )
    expect(canvas.getByText('+100 MNT')).toBeInTheDocument()
    waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Connect' })).toBeEnabled()
    })
  }
}

export const EligibleButQuestTypeClaimDisabled: Story = {
  tags: ['!dev'],
  decorators: [
    createQuestWrapperDecorator({
      flags: {
        ...defaultQuestWrapperProps.flags,
        questTypeClaimable: {
          LEADERBOARD: false,
          PLAYSTREAK: true,
          'REPUTATIONAL-AIRDROP': true
        }
      },
      getExternalEligibility: async () => {
        return {
          walletOrEmail: '0x123',
          amount: '100000000000000000000',
          questId: mockQuest.id
        }
      },
      getActiveWallet: async () => {
        return '0x123'
      },
      getQuest: async () => {
        return {
          ...mockQuest,
          status: 'CLAIMABLE',
          type: 'LEADERBOARD',
          rewards: mockReward
        }
      }
    })
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForElementToBeRemoved(() =>
      canvas.getByLabelText('loading rewards')
    )
    expect(canvas.getByText('+100 MNT')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Connect' })).toBeDisabled()
  }
}

export const EligibleButHasExistingSignature: Story = {
  decorators: [
    createQuestWrapperDecorator({
      flags: {
        ...defaultQuestWrapperProps.flags,
        questTypeClaimable: {
          LEADERBOARD: false,
          PLAYSTREAK: true,
          'REPUTATIONAL-AIRDROP': true
        }
      },
      getExternalEligibility: async () => {
        return {
          walletOrEmail: '0x123',
          amount: '100000000000000000000',
          questId: mockQuest.id
        }
      },
      getActiveWallet: async () => {
        return '0x123'
      },
      getQuest: async () => {
        return {
          ...mockQuest,
          status: 'CLAIMABLE',
          type: 'LEADERBOARD',
          rewards: mockReward
        }
      },
      getExistingSignature: async () => {
        return {
          signature: '0x123',
          gameplayWallet: {
            walletAddress: '0xD5aC06EFef1416447318784B6f4E78BB9f05d667'
          }
        }
      }
    })
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitForElementToBeRemoved(() =>
      canvas.getByLabelText('loading rewards')
    )
    expect(canvas.getByText('+100 MNT')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Claim' })).toBeDisabled()
  }
}
