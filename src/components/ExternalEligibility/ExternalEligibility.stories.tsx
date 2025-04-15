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
  }
}

export default meta

type Story = StoryObj<typeof ExternalEligibility>

export const Default: Story = {
  args: {}
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
