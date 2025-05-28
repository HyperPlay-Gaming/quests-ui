import { getGetQuestLogInfoQueryKey } from '@/helpers/getQueryKeys'
import { getRewardClaimGasEstimation } from '@/helpers/getRewardClaimGasEstimation'
import { mintReward } from '@/helpers/mintReward'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import {
  NotEnoughGasError,
  UseGetRewardsData,
  WarningError
} from '@/types/quests'
import { chainMap, parseChainMetadataToViemChain } from '@hyperplay/chains'
import { Reward as RewardUi } from '@hyperplay/ui'
import { Quest, Reward, RewardClaimSignature } from '@hyperplay/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  http,
  UserRejectedRequestError
} from 'viem'
import { useAccount, useConfig, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import styles from './index.module.scss'
import { useCanClaimReward } from '@/hooks/useCanClaimReward'
import { useGetUserPlayStreak } from '@/hooks/useGetUserPlayStreak'
import { switchChain } from '@wagmi/core'
import { useGetActiveWallet } from '@/hooks/useGetActiveWallet'
import { ClaimErrorAlert } from '../ClaimErrorAlert'
import {
  errorIsSwitchChainError,
  errorIsUserRejected
} from '@/helpers/claimErrors'
import { useGetListingByProjectId } from '@/hooks/useGetListingById'

const getClaimEventProperties = (reward: Reward, questId: number | null) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    amount_per_user,
    chain_id,
    marketplace_url,
    decimals,
    ...rewardToTrack_i
  } = reward
  return {
    ...rewardToTrack_i,
    quest_id: questId?.toString() ?? ''
  }
}

interface RewardWrapperProps {
  reward: UseGetRewardsData
  questId: number | null
  questMeta: Quest
  hideClaim?: boolean
}

export function RewardWrapper({
  reward,
  questId,
  questMeta,
  hideClaim
}: RewardWrapperProps) {
  const queryClient = useQueryClient()
  const { t: tOriginal } = useTranslation()
  const account = useAccount()
  const { connectAsync } = useConnect()
  const config = useConfig()

  // Context
  const {
    flags,
    sessionEmail,
    tOverride,
    isSignedIn,
    trackEvent,
    logError,
    logInfo,
    getDepositContracts,
    getQuestRewardSignature,
    confirmRewardClaim,
    onRewardClaimed,
    claimPoints,
    checkG7ConnectionStatus,
    completeExternalTask,
    openDiscordLink,
    getExternalEligibility,
    getUserPlayStreak,
    onShowMetaMaskPopup,
    getActiveWallet,
    getListingById
  } = useQuestWrapper()

  /**
   * @dev We don’t handle loading here, so if the hook is still fetching, the claim‑exceeded message may briefly omit game details.
   * To prevent this, we pass external claims into useGetRewards to keep the rewards section in its loading state until all data (eligibility, etc.) arrives.
   * This is low risk since the message only appears after the user clicks “claim.”
   */
  const projectId = questMeta.project_id
  const { data: listingData } = useGetListingByProjectId(
    projectId ?? null,
    getListingById
  )
  const gameName = listingData.data?.project_meta.name

  // State
  const [claimError, setClaimError] = useState<Error | WarningError | null>(
    null
  )

  const connectorName = String(account?.connector?.name)

  const { activeWallet } = useGetActiveWallet({
    getActiveWallet,
    enabled: isSignedIn
  })

  const shouldEnforceActiveWallet = Boolean(flags.gameplayWalletSectionVisible)
  const validActiveWallet = shouldEnforceActiveWallet
    ? Boolean(activeWallet)
    : true

  const claimEnabledForQuestType =
    flags.questTypeClaimable[questMeta.type] ?? false

  const {
    canClaim: canClaimReward,
    isLoading: isCanClaimLoading,
    invalidateQuery: invalidateCanClaimQuery
  } = useCanClaimReward({
    quest: questMeta,
    getExternalEligibility,
    getUserPlayStreak,
    enabled: isSignedIn && validActiveWallet
  })

  const { invalidateQuery: invalidateQuestPlayStreakQuery } =
    useGetUserPlayStreak(questId, getUserPlayStreak)
  // Translation override
  const t = tOverride || tOriginal

  function trackRewardClaimMutationError(error: Error) {
    console.error('Error claiming rewards:', error)

    let errorMessage = 'Error during reward claim'
    let errorSeverity = 'Error'

    let errorProps = {}
    /**
     * @dev this block gets a useful error message in the mutate onError handler for tracking and logging purposes
     */
    if (error instanceof BaseError) {
      errorSeverity = 'Error'
      // @dev this is the suggested approach for simulateContract errors https://viem.sh/docs/contract/simulateContract#handling-custom-errors
      const revertError = error.walk(
        (err) => err instanceof ContractFunctionRevertedError
      )
      if (revertError instanceof ContractFunctionRevertedError) {
        errorMessage = revertError.reason ?? 'Unknown BaseError revert reason'
      } else if (revertError) {
        errorMessage = `BaseError: ${revertError.name} ${revertError.message}`
      } else if (errorIsSwitchChainError(error)) {
        logError(`Error switching chains: ${error}`)
        const switchChainError = error
        errorProps = {
          errorName: error.name,
          errorShortMessage: switchChainError.shortMessage,
          errorDetails: switchChainError.details,
          errorCode: switchChainError.code,
          viemVersion: switchChainError.version
        }
        errorMessage = JSON.stringify(error, null, 2)
      } else {
        errorMessage = JSON.stringify(error, null, 2)
      }
    } else if (error instanceof WarningError) {
      errorSeverity = 'Warning'
      // thrown for low balance and g7 account link errors
      logError(`Error claiming rewards. Warning Error: ${error}`)
      errorMessage = error.title
    } else if (error instanceof Error) {
      errorMessage = JSON.stringify(error.message, null, 2)
    } else {
      errorMessage = JSON.stringify(error, null, 2)
    }

    trackEvent({
      event: `Reward Claim ${errorSeverity}`,
      properties: {
        ...getClaimEventProperties(reward, questId),
        error: errorMessage,
        connector: connectorName,
        ...errorProps
      }
    })

    return errorMessage
  }

  // Mutations
  const claimRewardMutation = useMutation({
    mutationFn: async (params: UseGetRewardsData) => claimReward(params),
    onSuccess: async (_data, reward) => {
      trackEvent({
        event: 'Reward Claim Success',
        properties: getClaimEventProperties(reward, questId)
      })

      onRewardClaimed?.(reward)
      await invalidateQuestPlayStreakQuery()
      await invalidateCanClaimQuery()

      if (questId !== null) {
        await queryClient.invalidateQueries({
          queryKey: [getGetQuestLogInfoQueryKey(questId.toString())]
        })
      }

      if (reward.reward_type === 'POINTS') {
        const queryKey = `getPointsBalancesForProject:${questMeta?.project_id}`
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      }

      if (reward.reward_type === 'EXTERNAL-TASKS') {
        const queryKey = `useGetG7UserCredits`
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      }
    },
    onError: (error) => {
      setClaimError(error)

      if (String(claimError).includes('EXCEEDED_CLAIM')) {
        logInfo(`Device claims exceeded: ${error}`)
        trackEvent({
          event: 'Device claims exceeded',
          properties: getClaimEventProperties(reward, questId)
        })
        return
      }

      if (errorIsUserRejected(error)) {
        logInfo(`User rejected claim: ${error}`)
        trackEvent({
          event: 'Reward Claim User Rejected',
          properties: getClaimEventProperties(reward, questId)
        })
        return
      }

      const errorMessage = trackRewardClaimMutationError(error)

      logError(`Error claiming rewards: ${error}`, {
        sentryException: error,
        sentryExtra: {
          questId: questId,
          reward: reward,
          connector: connectorName,
          error: errorMessage
        },
        sentryTags: {
          action: 'claim_on_chain_reward',
          feature: 'quests'
        }
      })
    }
  })

  const completeTask = async (reward: Reward) => {
    const isConnectedToG7 = await checkG7ConnectionStatus()

    if (!isConnectedToG7) {
      throw new WarningError(
        'No G7 Account Linked',
        t(
          'quest.noG7ConnectionSync.message',
          `You need to have a Game7 account linked to ${sessionEmail ?? 'your email'} to claim your rewards.`,
          { email: sessionEmail ?? 'your email' }
        )
      )
    }

    await completeExternalTask(reward)
  }

  // Handlers
  const mintOnChainReward = async (reward: UseGetRewardsData) => {
    if (questMeta?.id === undefined) {
      throw Error('tried to mint but quest meta id is undefined')
    }

    if (reward.chain_id === null) {
      throw Error('chain id is not set for reward when trying to mint')
    }

    let address: `0x${string}` | undefined

    /**
     * handles https://github.com/HyperPlay-Gaming/product-management/issues/801
     * Sometimes wagmi does not establish a connection but useAccount returns the address.
     * We need to check that the switch chain method exists before proceeding with claiming.
     */
    let connectionHasSwitchChain = false
    if (config.state.current) {
      const currentConnection = config.state.connections.get(
        config.state.current
      )
      connectionHasSwitchChain = !!currentConnection?.connector.switchChain
    }

    if (account.address && connectionHasSwitchChain) {
      address = account.address
    } else {
      onShowMetaMaskPopup?.()
      logInfo('connecting to wallet...')
      const { accounts } = await connectAsync({ connector: injected() })
      address = accounts[0]
    }
    if (!address) {
      throw Error('no address found when trying to mint')
    }

    await switchChain(config, { chainId: reward.chain_id })

    const gasNeeded = await getRewardClaimGasEstimation(reward, logInfo)
    const chainMetadata = chainMap[reward.chain_id]
    const viemChain = parseChainMetadataToViemChain(chainMetadata)
    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http()
    })

    const walletBalance = await publicClient.getBalance({ address })
    const hasEnoughBalance = walletBalance >= gasNeeded

    logInfo(`Current wallet gas: ${walletBalance}`)

    if (!hasEnoughBalance) {
      logError(
        `Not enough balance in the connected wallet to cover the gas fee associated with this Quest Reward claim. Current balance: ${walletBalance}, gas needed: ${gasNeeded}`
      )
      throw new NotEnoughGasError()
    }

    let tokenId: number | undefined = undefined
    const isERC1155Reward =
      reward.reward_type === 'ERC1155' && reward.token_ids.length === 1

    if (isERC1155Reward) {
      tokenId = reward.token_ids[0].token_id
    }

    const claimSignature: RewardClaimSignature = await getQuestRewardSignature(
      address,
      reward.id,
      tokenId
    )

    const hash = await mintReward({
      questId: questMeta.id,
      signature: claimSignature,
      reward,
      getDepositContracts,
      config
    })

    // this is a workaround specifically for the client
    // When the user rejects the transaction the error is not a viem error, is an ethers.js error that wagmi returns as a valid tx hash
    if (
      typeof hash === 'object' &&
      String(hash).includes('ethers-user-denied')
    ) {
      throw new UserRejectedRequestError(
        new Error(`${hash} - user rejected action`)
      )
    }

    await confirmRewardClaim({
      signature: claimSignature.signature,
      transactionHash: hash
    })
  }

  async function claimReward(reward: UseGetRewardsData) {
    if (questId === null) {
      throw Error('questId is not set when trying to claim rewards')
    }

    const isRewardTypeClaimable =
      flags.rewardTypeClaimEnabled[reward.reward_type]

    if (!claimEnabledForQuestType) {
      throw new Error(`quest type ${questMeta.type} is not claimable`)
    }

    if (!isRewardTypeClaimable) {
      throw new Error(`reward type ${reward.reward_type} is not claimable`)
    }

    trackEvent({
      event: 'Reward Claim Started',
      properties: getClaimEventProperties(reward, questId)
    })

    switch (reward.reward_type) {
      case 'ERC1155':
      case 'ERC721':
      case 'ERC20':
        await mintOnChainReward(reward)
        break
      case 'POINTS':
        await claimPoints(reward)
        break
      case 'EXTERNAL-TASKS':
        await completeTask(reward)
        break
      default:
        throw new Error(`unknown reward type ${reward.reward_type}`)
    }
  }

  const onClaim = async (reward: UseGetRewardsData) => {
    setClaimError(null)

    if (!isSignedIn) {
      setClaimError(
        new WarningError(
          t('quest.notSignedIn.title', 'Not signed in'),
          t(
            'quest.notSignedIn.message',
            'You need to be signed in to claim your reward.'
          )
        )
      )
      return
    }

    claimRewardMutation.mutate(reward)
  }

  // Effects
  useEffect(() => {
    setClaimError(null)
  }, [questId])

  let networkName = 'Unknown Chain'

  if (reward.chainName && reward.chain_id) {
    networkName = chainMap[reward.chain_id.toString()].chain?.name ?? ''
  }

  const canClaim = claimEnabledForQuestType && canClaimReward

  return (
    <div className={styles.rewardContainer}>
      <RewardUi
        reward={{
          ...reward,
          claimPending: claimRewardMutation.isPending || isCanClaimLoading
        }}
        key={reward.title}
        onClaim={async () => onClaim(reward)}
        hideClaim={hideClaim}
        claimNotAvailable={!canClaim}
      />
      {claimError && !errorIsUserRejected(claimError) ? (
        <ClaimErrorAlert
          currentChain={account.chain}
          error={claimError}
          networkName={networkName}
          onOpenDiscordLink={openDiscordLink}
          gameName={gameName}
          maxNumOfClaims={reward.num_claims_per_device}
        />
      ) : null}
    </div>
  )
}
