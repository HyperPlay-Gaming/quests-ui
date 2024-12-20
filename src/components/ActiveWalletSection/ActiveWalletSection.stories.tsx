import type { Meta, StoryObj } from '@storybook/react'
import ActiveWalletSection from '.'
import { DarkContainer } from '@hyperplay/ui'
import styles from './story-styles.module.scss'
const meta = {
  title: 'Components/QuestDetailsWrapper/PlayStreak/ActiveWalletSection',
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
  },
  render: (args) => {
    return (
      <DarkContainer className={styles.root}>
        <ActiveWalletSection {...args} />
      </DarkContainer>
    )
  }
}

export const OnlyConnectedWallet: Story = {
  args: {
    connectedWallet: '0x1234...5678',
    activeWallet: null,
    setActiveWallet: () => {}
  },
  render: (args) => {
    return (
      <DarkContainer className={styles.root}>
        <ActiveWalletSection {...args} />
      </DarkContainer>
    )
  }
}

export const OnlyActiveWallet: Story = {
  args: {
    connectedWallet: null,
    activeWallet: '0x1234...5678',
    setActiveWallet: () => {}
  },
  render: (args) => {
    return (
      <DarkContainer className={styles.root}>
        <ActiveWalletSection {...args} />
      </DarkContainer>
    )
  }
}

export const ConnectedMatchesActive: Story = {
  args: {
    connectedWallet: '0x1234...5678',
    activeWallet: '0x1234...5678',
    setActiveWallet: () => {}
  },
  render: (args) => {
    return (
      <DarkContainer className={styles.root}>
        <ActiveWalletSection {...args} />
      </DarkContainer>
    )
  }
}

export const NewWalletDetected: Story = {
  args: {
    connectedWallet: '0xABCD...EFGH',
    activeWallet: '0x1234...5678',
    setActiveWallet: () => alert('setActiveWallet')
  },
  render: (args) => {
    return (
      <DarkContainer className={styles.root}>
        <ActiveWalletSection {...args} />
      </DarkContainer>
    )
  }
}
