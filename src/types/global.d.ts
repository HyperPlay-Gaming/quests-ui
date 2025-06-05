import { InjectedProviderMock } from '@/mocks/injectedProvider'

declare global {
  interface Window {
    ethereum: InjectedProviderMock
  }
}