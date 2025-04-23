import * as React from 'react'
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi'

function WalletOptions() {
  const { connectors, connect, isPending } = useConnect()
  console.log('isPending', isPending)
  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => {
        console.log('clicked', connector.name)
        connect({ connector })
      }}
    />
  ))
}

function WalletOption({
  connector,
  onClick
}: {
  connector: Connector
  onClick: () => void
}) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      console.log('ready', !!provider)
      setReady(!!provider)
    })()
  }, [connector])

  console.log('Connector', connector.name, ready)
  return (
    <button disabled={!ready} onClick={onClick}>
      {connector.name}
    </button>
  )
}

export function Connect() {
  const { address, connector, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  console.log('isConnected', isConnected)

  return (
    <div>
      <div>
        {isConnected && (
          <>
            <div>{address}</div>
            <button onClick={() => disconnect()}>
              Disconnect from {connector?.name}
            </button>
          </>
        )}
      </div>
      <WalletOptions />
    </div>
  )
}
