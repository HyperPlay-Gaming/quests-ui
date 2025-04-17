/// <reference types="vitest" />

import react from '@vitejs/plugin-react-swc'
import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import packageJson from './package.json'

export default defineConfig({
  publicDir: 'public',
  resolve: {
    alias: {
      '@': join(__dirname, 'src')
    }
  },
  // optimizeDeps: {
  //   exclude: ['@storybook/react-vite']
  // },
  plugins: [react(), dts()],
  build: {
    copyPublicDir: true,
    minify: 'esbuild',
    lib: {
      entry: resolve('src', 'index.ts'),
      name: 'HyperplayUI',
      formats: ['es'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
      input: [resolve(__dirname, './src/index.ts')]
    }
  }
})
