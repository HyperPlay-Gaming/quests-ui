import { Button, Images, Alert, LoadingSpinner, AlertCard } from '@hyperplay/ui'
import styles from './index.module.scss'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { truncateEthAddress } from '../truncateAddress'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { useAccount } from 'wagmi'
import { InfoAlertProps } from '@hyperplay/ui/dist/components/AlertCard'

function InfoAlert({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.newWalletDetectedContainer}>
      <div className={styles.infoIconContainer}>
        <Images.Info className={styles.infoIcon} />
      </div>
      <div className={styles.infoTextContainer}>
        <span className="title-sm">{title}</span>
        <div>{children}</div>
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

export default function ActiveWalletSection() {
  const queryClient = useQueryClient()
  const { address: connectedWallet, connector } = useAccount()
  const {
    getActiveWallet,
    setActiveWallet,
    tOverride,
    logError,
    openDiscordLink,
    getActiveWalletSignature
  } = useQuestWrapper()

  const connectorName = String(connector?.name)

  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  const { data: activeWallet } = useQuery({
    queryKey: ['activeWallet'],
    queryFn: async () => {
      return getActiveWallet()
    }
  })

  const {
    mutate: setActiveWalletMutation,
    isPending,
    error,
    reset: resetError
  } = useMutation({
    mutationFn: async () => {
      if (!connectedWallet) {
        throw new Error('No address found')
      }
      const signatureData = await getActiveWalletSignature()
      const response = await setActiveWallet(signatureData)

      if (response.status === 409) {
        throw new Error('Wallet already linked to another account', {
          cause: 'wallet_already_linked'
        })
      }

      if (!response.ok) {
        throw new Error(await response.text())
      }

      await queryClient.invalidateQueries({
        queryKey: ['activeWallet']
      })
    },
    onError: (error) => {
      let sentryProps = undefined

      if (error.cause !== 'wallet_already_linked') {
        sentryProps = {
          sentryException: error,
          sentryExtra: {
            error: error,
            connector: connectorName
          },
          sentryTags: {
            action: 'set_active_wallet',
            feature: 'quests'
          }
        }
      }

      logError(`Error setting active wallet: ${error.message}`, sentryProps)
    }
  })

  const onlyConnectedWallet = (
    <InfoAlert title={t('wallet.detected.title', 'Wallet Detected')}>
      <span className="body-sm">
        {t(
          'wallet.detected.message',
          'To track progress with this wallet, add it as a Gameplay Wallet below by setting it.'
        )}
      </span>{' '}
      <span className={cn('body-sm', styles.verifyText)}>
        {t(
          'wallet.verify.message',
          'You only need to verify each address once and can switch freely at any time.'
        )}
      </span>
    </InfoAlert>
  )

  const newWalletDetected = (
    <InfoAlert title={t('wallet.new.title', 'New Wallet Detected')}>
      <span className="body-sm">
        {t(
          'wallet.new.message',
          "Your connected wallet doesn't match any Gameplay wallet tracked for this Quest. To track progress with this wallet, add it as a Gameplay Wallet below by setting it."
        )}
      </span>{' '}
      <span className={cn('body-sm', styles.verifyText)}>
        {t(
          'wallet.verify.message',
          'You only need to verify each address once and can switch freely at any time.'
        )}
      </span>
    </InfoAlert>
  )

  const setButton = (
    <Button
      disabled={isPending}
      type="secondaryGradient"
      className={styles.setButton}
      onClick={() => setActiveWalletMutation()}
    >
      {isPending ? (
        <LoadingSpinner className={styles.loadingSpinner} />
      ) : (
        t('wallet.action.set', 'Set')
      )}
    </Button>
  )

  const hasNoWallets = !connectedWallet && !activeWallet
  const hasOnlyConnectedWallet = connectedWallet && !activeWallet
  const hasOnlyActiveWallet = activeWallet && !connectedWallet
  const hasMatchingWallets =
    Boolean(activeWallet && connectedWallet) && activeWallet === connectedWallet
  const hasDifferentWallets =
    Boolean(activeWallet && connectedWallet) && !hasMatchingWallets

  let content = null

  if (hasNoWallets) {
    content = (
      <>
        <Alert
          message={t(
            'wallet.noWallet.message',
            'No wallet connected. Connect wallet to track Quest progress.'
          )}
          variant="warning"
        />
        <InputLikeContainer
          title={t('wallet.active.title', 'Active Gameplay Wallet')}
        >
          <InputLikeBox className={styles.noWallet}>
            {t('wallet.noWallet.status', 'No wallet connected')}
          </InputLikeBox>
        </InputLikeContainer>
      </>
    )
  }

  if (hasOnlyConnectedWallet) {
    content = (
      <>
        {onlyConnectedWallet}
        <InputLikeContainer
          title={t('wallet.connected.title', 'Connected Wallet')}
        >
          <div className={styles.setActiveWalletContainer}>
            <InputLikeBox className={styles.setConnectedWalletInput}>
              {truncateEthAddress(connectedWallet ?? '')}
            </InputLikeBox>
            {setButton}
          </div>
        </InputLikeContainer>
      </>
    )
  }

  if (hasOnlyActiveWallet) {
    content = (
      <InputLikeContainer
        title={t('wallet.active.title', 'Active Gameplay Wallet')}
      >
        <InputLikeBox className={styles.activeWallet}>
          {truncateEthAddress(activeWallet)}
        </InputLikeBox>
      </InputLikeContainer>
    )
  }

  if (hasMatchingWallets) {
    content = (
      <InputLikeContainer title={t('wallet.connected.title', 'Active Wallet')}>
        <InputLikeBox className={styles.activeWallet}>
          {truncateEthAddress(activeWallet ?? '')}
        </InputLikeBox>
      </InputLikeContainer>
    )
  }

  if (hasDifferentWallets) {
    content = (
      <>
        {newWalletDetected}
        <InputLikeContainer
          title={t('wallet.active.title', 'Active Gameplay Wallet')}
        >
          <InputLikeBox className={styles.activeWallet}>
            {truncateEthAddress(activeWallet ?? '')}
          </InputLikeBox>
        </InputLikeContainer>
        <InputLikeContainer
          title={t('wallet.setConnected.title', 'Set Connected Wallet')}
        >
          <div className={styles.setActiveWalletContainer}>
            <InputLikeBox className={styles.setConnectedWalletInput}>
              {truncateEthAddress(connectedWallet ?? '')}
            </InputLikeBox>
            {setButton}
          </div>
        </InputLikeContainer>
      </>
    )
  }

  const alertProps: InfoAlertProps = {
    showClose: false,
    title: t('wallet.error.title', 'Something went wrong'),
    message: t(
      'wallet.error.message',
      "Please try once more. If it still doesn't work, create a Discord support ticket."
    ),
    actionText: t('wallet.error.action', 'Create Discord Ticket'),
    onActionClick: () => openDiscordLink(),
    variant: 'danger' as const
  }

  if (error?.cause === 'wallet_already_linked') {
    alertProps.title = t(
      'wallet.error.alreadyLinked.title',
      'Wallet already linked'
    )
    alertProps.message = t(
      'wallet.error.alreadyLinked.message',
      'This address is already linked to another account. Try another address.'
    )
    alertProps.onActionClick = undefined
    alertProps.actionText = undefined
    alertProps.showClose = true;
    alertProps.onClose = resetError;
  }

  return (
    <div className={styles.root}>
      {content}
      {error && <AlertCard {...alertProps} />}
    </div>
  )
}
