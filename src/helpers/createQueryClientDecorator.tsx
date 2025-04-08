import { StoryContext, StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Creates a decorator that provides a fresh QueryClient for each story
 * This ensures that the query cache doesn't persist between story renders
 */
export const createQueryClientDecorator = (
  Story: StoryFn,
  context: StoryContext
) => {
  const freshQueryClient = new QueryClient()
  return (
    <QueryClientProvider client={freshQueryClient}>
      <Story {...context.args} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
