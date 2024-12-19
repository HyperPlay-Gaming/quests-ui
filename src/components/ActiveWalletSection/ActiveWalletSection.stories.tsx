import type { Meta, StoryObj } from '@storybook/react'
import ActiveWalletSection from '.'

const meta = {
  title: 'Components/ActiveWalletSection',
  component: ActiveWalletSection,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark'
    }
  }
} satisfies Meta<typeof ActiveWalletSection>

export default meta
type Story = StoryObj<typeof meta>

export const NoWalletConnected: Story = {
  args: {
    connectedWallet: null,
    activeWallet: null,
    setActiveWallet: () => {}
  }
}

export const OnlyActiveWallet: Story = {
  args: {
    connectedWallet: null,
    activeWallet: '0x1234...5678',
    setActiveWallet: () => {}
  }
}

export const ConnectedMatchesActive: Story = {
  args: {
    connectedWallet: '0x1234...5678',
    activeWallet: '0x1234...5678',
    setActiveWallet: () => {}
  }
}

export const NewWalletDetected: Story = {
  args: {
    connectedWallet: '0xABCD...EFGH',
    activeWallet: '0x1234...5678',
    setActiveWallet: () => alert('setActiveWallet')
  }
}
