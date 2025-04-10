import type { Meta, StoryObj } from '@storybook/react'
import RewardsBanner from '.'
import { createQueryClientDecorator } from '@/helpers/createQueryClientDecorator'
import {
  QuestWrapperProvider,
  mockQuest
} from '@/utils/storybook/wrapper-provider'
import dayjs from 'dayjs'
import styles from './story-styles.module.scss'

const meta: Meta<typeof RewardsBanner> = {
  component: RewardsBanner,
  title: 'Components/RewardsBanner',
  decorators: [createQueryClientDecorator],
  args: {
    quest: mockQuest
  },
  render: (args) => {
    return (
      <QuestWrapperProvider>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export default meta

type Story = StoryObj<typeof RewardsBanner>

export const NotSignedIn: Story = {
  render: (args) => {
    return (
      <QuestWrapperProvider isSignedIn={false}>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export const InProgressQuest: Story = {
  args: {}
}

export const InWaitPeriod: Story = {
  args: {
    quest: {
      ...mockQuest,
      end_date: dayjs().subtract(7, 'days').toISOString()
    }
  },
  render: (args) => {
    return (
      <QuestWrapperProvider>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}

export const InClaimPeriodAndNotEligible: Story = {
  args: {
    quest: {
      ...mockQuest,
      status: 'CLAIMABLE',
      end_date: dayjs().subtract(7, 'days').toISOString()
    }
  },
  render: (args) => {
    return (
      <QuestWrapperProvider>
        <div className={styles.root}>
          <RewardsBanner {...args} />
        </div>
      </QuestWrapperProvider>
    )
  }
}
