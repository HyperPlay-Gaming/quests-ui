import mainConfig from './vite.config'
import { defineConfig } from 'vite'

export default defineConfig({
  ...mainConfig,
  test: {
    include: ['src/**/*.unit.test.ts'],
  }
})