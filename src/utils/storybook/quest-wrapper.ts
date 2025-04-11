import { waitForElementToBeRemoved, within } from '@storybook/test'

export async function waitForLoadingSpinnerToDisappear(
  canvas: ReturnType<typeof within>
) {
  await waitForElementToBeRemoved(() =>
    canvas.getByLabelText('loading quest details')
  )

  await waitForElementToBeRemoved(() =>
    canvas.getByLabelText('loading rewards')
  )
}
