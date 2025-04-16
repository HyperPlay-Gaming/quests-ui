import { ethers } from 'ethers'

export class InjectedProviderMock extends EventTarget {
  isMetaMask = true
  key = new ethers.SigningKey(ethers.randomBytes(32))
  mockProvider: ethers.Wallet | undefined = undefined
  address = ''
  constructor() {
    super()
    this.mockProvider = new ethers.Wallet(this.key)
    this.address = this.mockProvider?.address ?? ''
  }

  async request({ method }: { method: any; params: any }) {
    if (method === 'eth_requestAccounts') {
      return [this.mockProvider?.address] // Return the mock provider's address
    } else if (method === 'wallet_requestPermissions') {
      return [{ eth_accounts: {} }] // Handle wallet request permissions
    } else if (method === 'eth_chainId') {
      return 1
    } else if (method === 'wallet_switchEthereumChain') {
      throw 'Unknown method(s) requested'
      // const err = new Error('Invalid chainId')
      // // @ts-expect-error need this code
      // err.code = 4902
      // throw err
    } else if (method === 'wallet_addEthereumChain') {
      throw 'Unknown method(s) requested'
    }
  }

  on(...args: any) {
    // @ts-expect-error it works
    this.addEventListener(...args)
  }

  off(...args: any) {
    // @ts-expect-error it works
    this.removeEventListener(...args)
  }
}
