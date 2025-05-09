import mainConfig from './vite.config'
import { mergeConfig } from 'vite'

export default mergeConfig(mainConfig, {
  test: {
    include: ['src/**/*.unit.test.ts']
  }
})
