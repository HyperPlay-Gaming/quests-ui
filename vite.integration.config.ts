import mainConfig from './vite.config'
import { mergeConfig } from 'vite'

export default mergeConfig(mainConfig, {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.test.ts?(x)', '!src/**/*.unit.test.ts']
  }
})
