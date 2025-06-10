import { Meta, StoryObj } from '@storybook/react/*'
import { ExistingSignatureErrorAlert } from './index'

const meta: Meta<typeof ExistingSignatureErrorAlert> = {
  title: 'components/ExistingSignatureErrorAlert',
  component: ExistingSignatureErrorAlert,
  render: (args) => (
    <div style={{ padding: '20px', backgroundColor: 'black' }}>
      <ExistingSignatureErrorAlert {...args} />
    </div>
  )
}

export default meta

type Story = StoryObj<typeof ExistingSignatureErrorAlert>

export const Default: Story = {
  args: {
    existingSignatureAddress: '0x563A69DF666A09fA0A7D4fd2427058A641eDbE9b'
  }
}
