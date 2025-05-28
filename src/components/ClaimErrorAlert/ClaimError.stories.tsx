import { Meta, StoryObj } from '@storybook/react'
import { ClaimErrorAlert } from './index'
import { NotEnoughGasError, WarningError } from '@/types/quests'
import { mantle, mainnet } from 'viem/chains'

const meta: Meta<typeof ClaimErrorAlert> = {
  title: 'Components/ClaimErrorAlert',
  component: ClaimErrorAlert,
  args: {
    networkName: 'Mantle',
    onOpenDiscordLink: () => alert('Discord link clicked'),
    currentChain: mantle
  },
  render: (args) => (
    <div style={{ padding: '20px', backgroundColor: 'black' }}>
      <ClaimErrorAlert {...args} />
    </div>
  )
}

export default meta

type Story = StoryObj<typeof ClaimErrorAlert>

export const Warning: Story = {
  args: {
    error: new WarningError(
      'Not signed in',
      'Please sign in to claim your reward'
    )
  }
}

export const NotEnoughGas: Story = {
  args: {
    error: new NotEnoughGasError()
  }
}

export const NotEnoughGasNoUrlAvailable: Story = {
  args: {
    error: new NotEnoughGasError(),
    currentChain: mainnet
  }
}

export const SwitchChainError: Story = {
  args: {
    error: new Error('user rejected switching chain')
  }
}

export const ExceededClaimFallback: Story = {
  args: {
    error: new Error('EXCEEDED_CLAIM')
  }
}

export const ExceededClaim: Story = {
  args: {
    error: new Error('EXCEEDED_CLAIM'),
    maxNumOfClaims: '2',
    gameName: 'Lorem ipsum'
  }
}

export const GenericError: Story = {
  args: {
    error: new Error('Something went wrong')
  }
}
