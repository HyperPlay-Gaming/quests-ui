import { AlertCard, Button, Images } from '@hyperplay/ui'
import { useTranslation } from 'react-i18next'
import { Chain, mantle } from 'viem/chains'
import {
  ClaimError,
  ExistingSignatureError,
  NotEnoughGasError,
  WarningError
} from '@/types/quests'
import { errorIsSwitchChainError } from '@/helpers/claimErrors'

import styles from './index.module.scss'
import { ExistingSignatureErrorAlert } from '../ExistingSignatureErrorAlert'

const { AlertOctagon, WarningIcon } = Images

const gasInformation: Record<number, { url: string }> = {
  [mantle.id]: {
    url: 'https://www.mantle.xyz/mnt'
  }
}

type ClaimErrorAlertProps = {
  error: Error | WarningError | ClaimError
  networkName: string
  currentChain: Chain | undefined
  onOpenDiscordLink: () => void
  gameName?: string | null
  maxNumOfClaims?: string | null
}

export const ClaimErrorAlert = ({
  error,
  networkName,
  onOpenDiscordLink,
  currentChain,
  gameName,
  maxNumOfClaims
}: ClaimErrorAlertProps) => {
  const { t } = useTranslation()
  const claimsExceeded = String(error).includes('EXCEEDED_CLAIM')

  if (error instanceof WarningError) {
    return (
      <AlertCard
        icon={<WarningIcon />}
        showClose={false}
        title={error.title}
        message={error.message}
        variant="warning"
        noBorderLeft={true}
      />
    )
  }

  if (error instanceof ExistingSignatureError) {
    return (
      <ExistingSignatureErrorAlert
        existingSignatureAddress={
          error.existingSignature.gameplayWallet.walletAddress
        }
      />
    )
  }

  if (error instanceof NotEnoughGasError) {
    const currency = currentChain?.nativeCurrency.symbol
    const gasUrl = currentChain ? gasInformation[currentChain.id]?.url : null

    let title = t('quest.notEnoughGas.title-no-currency', `Not enough gas`)
    let message = t(
      'quest.notEnoughGas.message-no-currency',
      `You'll need a bit of this chain's gas token to claim your reward`
    )

    if (currency) {
      title = t('quest.notEnoughGas.title', `Not enough {{symbol}}`, {
        symbol: currency
      })
      message = t(
        'quest.notEnoughGas.message',
        `You'll need a bit of {{symbol}} to claim your reward.`,
        {
          symbol: currency
        }
      )
    }

    return (
      <AlertCard
        icon={<AlertOctagon />}
        showClose={false}
        title={title}
        message={
          <>
            <div>{message}</div>
            {gasUrl ? (
              <div>
                <Button type="link" className={styles.link}>
                  <a href={gasUrl} target="_blank" rel="noopener noreferrer">
                    {t('quest.notEnoughGas.clickHere', `Click here`)}
                  </a>
                </Button>{' '}
                {t(
                  'quest.notEnoughGas.thenComeBack',
                  `to learn how to get some, then come back to try again.`
                )}
              </div>
            ) : null}
          </>
        }
        variant="error"
        noBorderLeft={true}
      />
    )
  }

  if (errorIsSwitchChainError(error)) {
    return (
      <AlertCard
        icon={<AlertOctagon />}
        showClose={false}
        title={t(
          'quest.switchChainFailed.title',
          'Failed to switch to {{chainName}}',
          { chainName: networkName }
        )}
        message={t(
          'quest.switchChainFailed.message',
          'Please switch to {{chainName}} within your wallet, or try again with MetaMask.',
          { chainName: networkName }
        )}
        variant="error"
        noBorderLeft={true}
      />
    )
  }

  if (claimsExceeded) {
    let exceededClaimMessage = t(
      'quest.multipleClaimsDetected.message',
      `You've already claimed this quest the max number of times. Please note that HyperPlay doesn't decide eligibility for this type of quest. If this seems wrong, please open a support ticket using the link below.`
    )
    if (gameName && maxNumOfClaims !== undefined && maxNumOfClaims !== null) {
      exceededClaimMessage = t(
        'quest.multipleClaimsDetected.messageWithVariables',
        `You've already claimed this quest with {{maxNumOfClaims}} wallet(s).\n{{gameName}} allows a max of {{maxNumOfClaims}} claims per user to keep things fair.\nPlease note that HyperPlay doesn't decide eligibility for leaderboard quests — that's handled by {{gameName}}. If this seems wrong, please open a support ticket using the link below.`,
        { gameName, maxNumOfClaims }
      )
    }
    return (
      <AlertCard
        icon={<AlertOctagon />}
        showClose={false}
        title={t(
          'quest.multipleClaimsDetected.title',
          'Multiple Claims Detected'
        )}
        message={exceededClaimMessage}
        variant="error"
        noBorderLeft={true}
      />
    )
  }

  return (
    <AlertCard
      icon={<AlertOctagon />}
      showClose={false}
      title={t('quest.claimFailed', 'Claim failed')}
      message={t(
        'quest.claimFailedMessage',
        "Please try once more. If it still doesn't work, create a Discord support ticket."
      )}
      variant="error"
      noBorderLeft={true}
      link={{
        text: t('quest.createDiscordTicket', 'Create Discord Ticket'),
        onClick: onOpenDiscordLink
      }}
    />
  )
}
