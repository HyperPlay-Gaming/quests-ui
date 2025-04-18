import { Meta, StoryObj } from '@storybook/react'
import { ExternalEligibility } from './'
import { within, expect } from '@storybook/test'

const meta: Meta<typeof ExternalEligibility> = {
  title: 'Components/ExternalEligibility',
  component: ExternalEligibility,
  argTypes: {
    externalLink: {
      control: 'text'
    }
  },
  args: {
    externalLink: 'https://www.google.com'
  },
  render: (args) => {
    return (
      <div style={{ width: '600px' }}>
        <ExternalEligibility {...args} />
      </div>
    )
  }
}

export default meta

type Story = StoryObj<typeof ExternalEligibility>

export const Default: Story = {
  args: {}
}

export const InGameLeaderboard: Story = {
  args: {
    externalLink: null
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('Available in-game')).toBeInTheDocument()
  }
}

export const InvalidUrl: Story = {
  args: {
    externalLink: 'http://localhost:3000'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.queryByRole('link', { name: 'View' })
    expect(link).not.toBeInTheDocument()
  }
}
