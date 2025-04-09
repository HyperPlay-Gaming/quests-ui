import { Meta, StoryObj } from '@storybook/react'
import { ExternalEligibility } from './'

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
