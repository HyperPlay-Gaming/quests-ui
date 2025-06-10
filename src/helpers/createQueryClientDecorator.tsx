import { Decorator } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Creates a decorator that provides a fresh QueryClient for each story
 * This ensures that the query cache doesn't persist between story renders
 */
export const createQueryClientDecorator: Decorator = (Story, context) => {
  const freshQueryClient = new QueryClient()
  return (
    <QueryClientProvider client={freshQueryClient}>
      <Story {...context.args} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
