import { Button, Images, Alert } from '@hyperplay/ui'
import styles from './index.module.scss'
import cn from 'classnames'

function NewWalletDetected() {
  return (
    <div className={styles.newWalletDetectedContainer}>
      <div className={styles.infoIconContainer}>
        <Images.Info className={styles.infoIcon} />
      </div>
      <div className={styles.infoTextContainer}>
        <span className="title-sm">New Wallet Detected</span>
        <div>
          <span className="body-sm">
            {`Your connected wallet doesn't match any Gameplay wallet tracked for
          this Quest. To track progress with this wallet, add it as a Gameplay
          Wallet below by setting it.`}
          </span>{' '}
          <span className={cn('body-sm', styles.verifyText)}>
            {`You only need to verify each address once and can switch freely at any
          time.`}
          </span>
        </div>
      </div>
    </div>
  )
}

function InputLikeBox({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(styles.inputLikeContainer, className)}>
      <div className={styles.walletContainer}>
        {children}
        <Images.Wallet className={styles.walletIcon} />
      </div>
    </div>
  )
}

function InputLikeContainer({
  children,
  className,
  title
}: {
  children: React.ReactNode
  className?: string
  title: string
}) {
  return (
    <div className={cn(styles.container, className)}>
      <span className={cn(styles.label, 'caption')}>{title}</span>
      <div>{children}</div>
    </div>
  )
}

interface ActiveWalletSectionProps {
  connectedWallet: string | null
  activeWallet: string | null
  setActiveWallet: () => void
}

export default function ActiveWalletSection({
  connectedWallet,
  activeWallet,
  setActiveWallet
}: ActiveWalletSectionProps) {
  let activeWalletText = 'No wallet connected'

  if (activeWallet) {
    activeWalletText = activeWallet
  }

  const isNewWallet =
    Boolean(activeWallet && connectedWallet) && activeWallet !== connectedWallet

  return (
    <div className={styles.root}>
      {!connectedWallet && (
        <Alert
          message="No wallet connected. Connect wallet to track Quest progress."
          variant="warning"
        />
      )}
      {isNewWallet && <NewWalletDetected />}
      <InputLikeContainer title="Active Gameplay Wallet">
        <InputLikeBox
          className={cn({
            [styles.activeWallet]: Boolean(activeWallet),
            [styles.noWallet]: !activeWallet
          })}
        >
          {activeWalletText}
        </InputLikeBox>
      </InputLikeContainer>
      {isNewWallet && (
        <InputLikeContainer title="Set Connected Wallet">
          <div className={styles.setActiveWalletContainer}>
            <InputLikeBox className={styles.setConnectedWalletInput}>
              0xAB207...D713b
            </InputLikeBox>
            <Button
              type="secondaryGradient"
              className={styles.setButton}
              onClick={setActiveWallet}
            >
              Set
            </Button>
          </div>
        </InputLikeContainer>
      )}
    </div>
  )
}
