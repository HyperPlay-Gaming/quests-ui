import React from 'react'

import { Preview } from '@storybook/react'

import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HyperPlayDesignProvider } from '@hyperplay/ui'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import '@mantine/core/styles.css'
import '@hyperplay/ui/style.css'
import { ConnectWallet } from '../src/components/ConnectWallet'

import i18n from './i18n'
import { I18nextProvider } from 'react-i18next'

const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '878099c5ebd1a07a3785ec7ebee59ba6'

// 3. Set the networks
const networks = [mainnet]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId,
  themeMode: 'dark',
  features: {
    email: false,
    socials: false,
    onramp: false,
    analytics: false
  }
})
const preview: Preview = {
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <HyperPlayDesignProvider>
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <ConnectWallet />
              </div>
              <Story />
            </HyperPlayDesignProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </WagmiProvider>
      </I18nextProvider>
    )
  ]
}

export default preview
