import { Button, Images, LoadingSpinner, AlertCard } from '@hyperplay/ui'
import styles from './index.module.scss'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { truncateEthAddress } from '../truncateAddress'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { useAccount } from 'wagmi'
import { InfoAlertProps } from '@hyperplay/ui/dist/components/AlertCard'
import { Popover } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useGetActiveWallet } from '@/hooks/useGetActiveWallet'
import { getGetExternalEligibilityQueryKey } from '@/helpers/getQueryKeys'

const { WarningIcon, AlertOctagon } = Images

function ActiveWalletInfoTooltip() {
  const { tOverride } = useQuestWrapper()
  const [opened, { close, open }] = useDisclosure(false)
  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  return (
    <Popover
      width={250}
      position="bottom-start"
      shadow="md"
      opened={opened}
      withArrow
      offset={0}
      classNames={{
        dropdown: styles.popoverDropdown,
        arrow: styles.popoverArrow
      }}
    >
      <Popover.Target>
        <span onMouseEnter={open} onMouseLeave={close}>
          <Images.Info className={styles.tooltipInfoIcon} />
        </span>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="caption-sm color-neutral-400">
          {t(
            'gameplayWallet.info.description',
            'This wallet address is set to track your quest eligibility. You can switch to a different wallet address at anytime—quest eligibility is saved to each wallet address separately.'
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  )
}

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
  title,
  tooltip
}: {
  children: React.ReactNode
  className?: string
  title: string
  tooltip?: React.ReactNode
}) {
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.labelContainer}>
        <span className={cn(styles.label, 'caption')}>{title}</span>
        {tooltip}
      </div>
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
    getActiveWalletSignature,
    getGameplayWallets,
    updateActiveWallet,
    trackEvent,
    isSignedIn
  } = useQuestWrapper()

  const connectorName = String(connector?.name)

  const sharedEventProperties = {
    walletAddress: connectedWallet,
    walletConnector: connectorName
  }

  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  const { activeWallet } = useGetActiveWallet({
    getActiveWallet,
    enabled: isSignedIn
  })

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'activeWallet' ||
        query.queryKey[0] === 'gameplayWallets' ||
        query.queryKey[0] === getGetExternalEligibilityQueryKey(null)[0] // we don't really care for the questId here
    })
  }

  const { data: gameplayWallets, refetch: refetchGameplayWallets } = useQuery({
    queryKey: ['gameplayWallets'],
    queryFn: async () => {
      return getGameplayWallets()
    },
    enabled: isSignedIn
  })

  const updateActiveWalletMutation = useMutation({
    mutationFn: async (walletId: number) => {
      trackEvent({
        event: 'Update Active Wallet Start',
        properties: {
          walletId,
          ...sharedEventProperties
        }
      })
      await updateActiveWallet(walletId)
      return walletId
    },
    onSuccess: (walletId) => {
      invalidateQueries()
      trackEvent({
        event: 'Update Active Wallet Success',
        properties: {
          walletId,
          ...sharedEventProperties
        }
      })
    },
    onError: (error, walletId) => {
      trackEvent({
        event: 'Update Active Wallet Error',
        properties: {
          error: JSON.stringify(error.message, null, 2),
          walletId,
          ...sharedEventProperties
        }
      })
    }
  })

  const addGameplayWalletMutation = useMutation({
    mutationFn: async () => {
      if (!connectedWallet) {
        throw new Error('No address found')
      }

      trackEvent({
        event: 'Add Gameplay Wallet Start',
        properties: {
          ...sharedEventProperties
        }
      })

      const signatureData = await getActiveWalletSignature()
      const response = await setActiveWallet(signatureData)

      if (response.status === 409) {
        throw new Error('Wallet already linked to another account', {
          cause: 'wallet_already_linked'
        })
      }

      if (!response.success) {
        throw new Error(response.message)
      }
    },
    onSuccess: () => {
      invalidateQueries()
      trackEvent({
        event: 'Add Gameplay Wallet Success',
        properties: {
          ...sharedEventProperties
        }
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

      trackEvent({
        event: 'Add Gameplay Wallet Error',
        properties: {
          error: JSON.stringify(error.message, null, 2),
          ...sharedEventProperties
        }
      })
    }
  })

  const onlyConnectedWallet = (
    <InfoAlert title={t('gameplayWallet.detected.title', 'Wallet Connected')}>
      <span className="body-sm">
        {t(
          'gameplayWallet.detected.message',
          'To track your quest eligibility, set this as your active wallet.'
        )}
      </span>
    </InfoAlert>
  )

  const newWalletDetected = (
    <InfoAlert title={t('gameplayWallet.new.title', 'New Wallet Connected')}>
      <span className="body-sm">
        {t(
          'gameplayWallet.new.message',
          'To track your quest eligibility on this new wallet, set it as your active wallet.'
        )}
      </span>
    </InfoAlert>
  )

  const setActiveWalletMutation = useMutation({
    mutationFn: async () => {
      addGameplayWalletMutation.reset()
      updateActiveWalletMutation.reset()

      let userGameplayWallets = gameplayWallets

      if (!userGameplayWallets) {
        const { data: newGameplayWallets } = await refetchGameplayWallets()
        userGameplayWallets = newGameplayWallets
      }

      const existingWallet = userGameplayWallets?.find(
        (wallet) => wallet.wallet_address === connectedWallet
      )

      if (existingWallet) {
        updateActiveWalletMutation.mutate(existingWallet.id)
      } else {
        addGameplayWalletMutation.mutate()
      }
    },
    onError: (error) => {
      logError(`Error setting active wallet: ${error.message}`, {
        sentryException: error,
        sentryExtra: {
          error: error,
          connector: connectorName
        },
        sentryTags: { action: 'set_active_wallet', feature: 'quests' }
      })
    }
  })

  const isPending =
    addGameplayWalletMutation.isPending ||
    updateActiveWalletMutation.isPending ||
    setActiveWalletMutation.isPending

  const setButton = (
    <Button
      disabled={isPending}
      type="secondaryGradient"
      className={styles.setButton}
      onClick={() => setActiveWalletMutation.mutate()}
    >
      {isPending ? (
        <LoadingSpinner className={styles.loadingSpinner} />
      ) : (
        t('gameplayWallet.action.set', 'Set as Active')
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

  const isNewWalletDetected =
    connectedWallet &&
    gameplayWallets &&
    !gameplayWallets.some((wallet) => wallet.wallet_address === connectedWallet)

  let content = null

  if (hasNoWallets) {
    content = (
      <>
        <AlertCard
          size="small"
          noBorderLeft
          showClose={false}
          title={t('gameplayWallet.noWallet.title', 'No wallet connected')}
          message={t(
            'gameplayWallet.noWallet.message',
            'Connect your wallet to start tracking eligibility for this Quest.'
          )}
          variant="warning"
          icon={<WarningIcon />}
        />
        <InputLikeContainer
          title={t('gameplayWallet.active.title', 'Connected Wallet')}
        >
          <InputLikeBox className={styles.noWallet}>
            {t('gameplayWallet.noWallet.status', 'No wallet connected')}
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
          title={t('gameplayWallet.connected.title', 'Connected Wallet')}
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
        title={t('gameplayWallet.active.title', 'Active Wallet')}
        tooltip={<ActiveWalletInfoTooltip />}
      >
        <InputLikeBox className={styles.activeWallet}>
          {truncateEthAddress(activeWallet)}
        </InputLikeBox>
      </InputLikeContainer>
    )
  }

  if (hasMatchingWallets) {
    content = (
      <InputLikeContainer
        title={t('gameplayWallet.active.title', 'Active Wallet')}
        tooltip={<ActiveWalletInfoTooltip />}
      >
        <InputLikeBox className={styles.activeWallet}>
          {truncateEthAddress(activeWallet ?? '')}
        </InputLikeBox>
      </InputLikeContainer>
    )
  }

  if (hasDifferentWallets) {
    content = (
      <>
        {isNewWalletDetected ? newWalletDetected : null}
        <InputLikeContainer
          title={t('gameplayWallet.active.title', 'Active Wallet')}
          tooltip={<ActiveWalletInfoTooltip />}
        >
          <InputLikeBox className={styles.activeWallet}>
            {truncateEthAddress(activeWallet ?? '')}
          </InputLikeBox>
        </InputLikeContainer>
        <InputLikeContainer
          title={t('gameplayWallet.setConnected.title', 'Connected Wallet')}
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
    noBorderLeft: true,
    showClose: false,
    icon: <AlertOctagon />,
    title: t('gameplayWallet.error.title', 'Something went wrong'),
    message: t(
      'gameplayWallet.error.message',
      "Please try once more. If it still doesn't work, create a Discord support ticket."
    ),
    link: {
      text: t('gameplayWallet.error.action', 'Create Discord Ticket'),
      onClick: () => openDiscordLink()
    },
    variant: 'error' as const
  }

  const error =
    addGameplayWalletMutation.error ??
    updateActiveWalletMutation.error ??
    setActiveWalletMutation.error

  if (error?.cause === 'wallet_already_linked') {
    alertProps.title = t(
      'gameplayWallet.error.alreadyLinked.title',
      'Wallet Already Linked'
    )
    alertProps.message = t(
      'gameplayWallet.error.alreadyLinked.message',
      'This wallet is linked to another HyperPlay account. Try a different one or sign in to to the associated account to continue.'
    )
    alertProps.showClose = true
    alertProps.onClose = () => {
      addGameplayWalletMutation.reset()
      updateActiveWalletMutation.reset()
      setActiveWalletMutation.reset()
    }
  }

  return (
    <div className={styles.root}>
      {content}
      {error && <AlertCard {...alertProps} />}
    </div>
  )
}
