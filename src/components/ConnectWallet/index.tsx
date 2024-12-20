import {
  useAccount,
  useConnect,
  useDisconnect
} from 'wagmi'
import { truncateEthAddress } from '../truncateAddress'

function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  return (
    <div>
    
      <button
        onClick={() => disconnect()}
        style={{
          backgroundColor: 'black',
          color: 'white',
          borderRadius: '9999px',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {truncateEthAddress(address ?? '')}
      </button>
    </div>
  )
}

export function ConnectWallet() {
  const { connectors, connect } = useConnect()
  const { isConnected } = useAccount()

  if (isConnected) return <Account />

  const connector = connectors[0]

  return (
    <button
      key={connector.uid}
      onClick={() => connect({ connector })}
      style={{
        backgroundColor: 'black',
        color: 'white',
        borderRadius: '9999px',
        padding: '8px 16px',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      Connect Wallet
    </button>
  )
}
