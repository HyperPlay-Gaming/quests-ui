import React from 'react'

import { Preview } from '@storybook/react'

import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HyperPlayDesignProvider } from '@hyperplay/ui'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '@mantine/core/styles.css'
import '@hyperplay/ui/style.css'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
})

const preview: Preview = {
  decorators: [
    (Story) => (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <HyperPlayDesignProvider>
            <Story />
          </HyperPlayDesignProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WagmiProvider>
    )
  ]
}

export default preview
