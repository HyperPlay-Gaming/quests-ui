import {
  waitFor,
  waitForElementToBeRemoved,
  within,
  expect
} from '@storybook/test'

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

export async function expectAllCTAsToBeDisabled(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await Promise.all(
    Array.from(canvas.getAllByRole('button', { name: /Connect/i })).map(
      async (button) => {
        await expect(button).toBeDisabled()
      }
    )
  )
}

export async function waitForAllCTAsToBeEnabled(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  // await for the claim button to be enabled
  await waitFor(() => {
    canvas.getAllByRole('button', { name: /Connect/i }).forEach((button) => {
      expect(button).toBeEnabled()
    })
  })
}
