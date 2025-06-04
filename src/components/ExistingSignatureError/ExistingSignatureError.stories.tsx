import { Meta, StoryObj } from '@storybook/react/*'
import { ExistingSignatureError } from './index'

const meta: Meta<typeof ExistingSignatureError> = {
  title: 'components/ExistingSignatureError',
  component: ExistingSignatureError,
  render: (args) => (
    <div style={{ padding: '20px', backgroundColor: 'black' }}>
      <ExistingSignatureError {...args} />
    </div>
  )
}

export default meta

type Story = StoryObj<typeof ExistingSignatureError>

export const Default: Story = {
  args: {
    existingSignatureAddress: '0x563A69DF666A09fA0A7D4fd2427058A641eDbE9b'
  }
}
