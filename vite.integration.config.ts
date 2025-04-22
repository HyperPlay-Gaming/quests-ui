import mainConfig from './vite.config'
import { defineConfig } from 'vite'

export default defineConfig({
  ...mainConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts']
  }
})
