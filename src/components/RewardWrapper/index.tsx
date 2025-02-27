import { getPlaystreakQuestStatus } from '@/helpers/getPlaystreakQuestStatus'
import { getGetQuestLogInfoQueryKey } from '@/helpers/getQueryKeys'
import { getRewardClaimGasEstimation } from '@/helpers/getRewardClaimGasEstimation'
import { mintReward } from '@/helpers/mintReward'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { ClaimError, UseGetRewardsData, WarningError } from '@/types/quests'
import { chainMap, parseChainMetadataToViemChain } from '@hyperplay/chains'
import { AlertCard, Reward as RewardUi } from '@hyperplay/ui'
import {
  ConfirmClaimParams,
  Quest,
  Reward,
  RewardClaimSignature,
  UserPlayStreak
} from '@hyperplay/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  http
} from 'viem'
import {
  useAccount,
  useConfig,
  useConnect,
  useSwitchChain,
  useWriteContract
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ConfirmClaimModal } from '../ConfirmClaimModal'
import styles from './index.module.scss'

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
  questPlayStreakData: UserPlayStreak | undefined | null
  invalidateQuestPlayStreakQuery: () => Promise<void>
  hideClaim?: boolean
}

export function RewardWrapper({
  reward,
  questId,
  questMeta,
  questPlayStreakData,
  invalidateQuestPlayStreakQuery,
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
    onShowMetaMaskPopup
  } = useQuestWrapper()

  // State
  const [showWarning, setShowWarning] = useState(false)
  const [claimError, setClaimError] = useState<
    Error | WarningError | ClaimError | null
  >(null)

  const connectorName = String(account?.connector?.name)

  // Contract interactions
  const { writeContractAsync, isPending: isPendingWriteContract } =
    useWriteContract({
      mutation: {
        onError: (error) =>
          logError(
            `Error interacting with contract for reward claim:  ${reward.title}`,
            {
              sentryException: error,
              sentryExtra: {
                questId: questId,
                reward: reward,
                error: error,
                connector: connectorName
              },
              sentryTags: {
                action: 'claim_on_chain_reward',
                feature: 'quests'
              }
            }
          )
      }
    })

  const {
    switchChainAsync,
    isPending: isPendingSwitchingChain,
    error: switchChainError
  } = useSwitchChain({
    mutation: {
      onError: (error) =>
        logError(`Error switching chain: ${error}`, {
          sentryException: error,
          sentryExtra: {
            questId: questId,
            reward: reward,
            error: error,
            connector: connectorName
          },
          sentryTags: {
            action: 'switch_chain',
            feature: 'quests'
          }
        })
    }
  })

  // Translation override
  const t = tOverride || tOriginal

  let isEligible = false

  if (questPlayStreakData) {
    const playstreakQuestStatus = getPlaystreakQuestStatus(
      questMeta,
      questPlayStreakData
    )
    isEligible = playstreakQuestStatus === 'READY_FOR_CLAIM'
  }

  function trackRewardClaimMutationError(error: Error) {
    console.error('Error claiming rewards:', error)

    let errorMessage = 'Error during reward claim'
    let errorSeverity = 'Error'

    /**
     * @dev this block gets a useful error message in the mutate onError handler for tracking and logging purposes
     */
    if (error instanceof BaseError) {
      errorSeverity = 'Warning'
      // @dev this is the suggested approach for simulateContract errors https://viem.sh/docs/contract/simulateContract#handling-custom-errors
      const revertError = error.walk(
        (err) => err instanceof ContractFunctionRevertedError
      )
      if (revertError instanceof ContractFunctionRevertedError) {
        const errorName = revertError.data?.errorName ?? ''
        // do something with `errorName`
        errorMessage = errorName
      } else if (revertError) {
        errorMessage = `BaseError: ${revertError.name} ${revertError.message}`
      } else {
        errorMessage = `Unknown BaseError`
      }
    } else if (error instanceof WarningError) {
      errorSeverity = 'Warning'
      // thrown for low balance and g7 account link errors
      logError(`Error claiming rewards: ${error}`)
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
        connector: connectorName
      }
    })

    return errorMessage
  }

  // Mutations
  const claimRewardMutation = useMutation({
    mutationFn: async (params: Reward) => claimReward(params),
    onSuccess: async (_data, reward) => {
      trackEvent({
        event: 'Reward Claim Success',
        properties: getClaimEventProperties(reward, questId)
      })

      onRewardClaimed?.(reward)
      await invalidateQuestPlayStreakQuery()
      if (questId !== null) {
        await queryClient.invalidateQueries({
          queryKey: [getGetQuestLogInfoQueryKey(questId.toString())]
        })
      }
    },
    onError: (error) => {
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

  const confirmClaimMutation = useMutation({
    mutationFn: async (params: ConfirmClaimParams) =>
      confirmRewardClaim(params),
    retry: 5,
    retryDelay: 1000,
    onSuccess: async () => {
      await invalidateQuestPlayStreakQuery()
    },
    onError: (error, variables) => {
      logError(
        `Error confirming reward claim ${error.message}, variables: ${JSON.stringify(
          {
            ...variables,
            address: account?.address
          }
        )}`,
        {
          sentryException: error,
          sentryExtra: {
            questId: questId,
            reward: reward,
            error: error,
            variables: variables,
            connector: connectorName,
            address: account?.address
          },
          sentryTags: {
            action: 'confirm_claim_on_chain_reward',
            feature: 'quests'
          }
        }
      )
    }
  })

  const claimPointsMutation = useMutation({
    mutationFn: async (reward: Reward) => {
      const result = await claimPoints(reward)
      const queryKey = `getPointsBalancesForProject:${questMeta?.project_id}`
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      return result
    },
    onError: (error) => {
      const errorMessage = trackRewardClaimMutationError(error)
      logError(`Error claiming points: ${error}`, {
        sentryException: error,
        sentryExtra: {
          questId: questId,
          reward: reward,
          error: errorMessage,
          connector: connectorName
        },
        sentryTags: {
          action: 'claim_points_reward',
          feature: 'quests'
        }
      })
    },
    onSuccess: async (_data, reward) => {
      await invalidateQuestPlayStreakQuery()
    }
  })

  const completeTaskMutation = useMutation({
    mutationFn: async (reward: Reward) => {
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

      const result = await completeExternalTask(reward)
      const queryKey = `useGetG7UserCredits`
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      return result
    },
    onError: (error) => {
      const errorMessage = trackRewardClaimMutationError(error)
      logError(`Error resyncing tasks: ${error}`, {
        sentryException: error,
        sentryExtra: {
          questId: questId,
          reward: reward,
          error: errorMessage,
          connector: connectorName
        },
        sentryTags: {
          action: 'complete_external_task'
        }
      })
    },
    onSuccess: async (_data, reward) => {
      await invalidateQuestPlayStreakQuery()
    }
  })

  // Handlers
  const mintOnChainReward = async (reward: Reward) => {
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

    await switchChainAsync({ chainId: reward.chain_id })

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
      throw new WarningError(
        'Low Balance',
        t(
          'quest.notEnoughGas.message',
          'Insufficient wallet balance to claim your reward due to gas fees. Try a different wallet or replenish this one before retrying.'
        )
      )
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
      writeContractAsync,
      getDepositContracts,
      logError,
      connectorName,
      config
    })

    await confirmClaimMutation.mutateAsync({
      signature: claimSignature.signature,
      transactionHash: hash
    })
  }

  async function claimReward(reward: Reward) {
    if (questId === null) {
      throw Error('questId is not set when trying to claim rewards')
    }

    const isRewardTypeClaimable =
      flags.rewardTypeClaimEnabled[reward.reward_type]

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
        await claimPointsMutation.mutateAsync(reward)
        break
      case 'EXTERNAL-TASKS':
        await completeTaskMutation.mutateAsync(reward)
        break
      default:
        throw new Error(`unknown reward type ${reward.reward_type}`)
    }
  }

  const onClaim = async (reward: Reward) => {
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

    if (!isEligible) {
      setClaimError(
        new WarningError(
          t('quest.notEligible.title', 'Not eligible yet'),
          t(
            'quest.notEligible.message',
            'You have not completed the required play streak days and can not claim your reward at this time.'
          )
        )
      )
      return
    }

    const isRewardOnChain = ['ERC1155', 'ERC721', 'ERC20'].includes(
      reward.reward_type
    )

    if (isRewardOnChain) {
      setShowWarning(true)
    } else {
      claimRewardMutation.mutate(reward)
    }
  }

  // Effects
  useEffect(() => {
    setClaimError(null)
  }, [questId])

  useEffect(() => {
    const error =
      claimRewardMutation.error ||
      claimPointsMutation.error ||
      completeTaskMutation.error ||
      switchChainError

    setClaimError(error)
  }, [
    claimRewardMutation.error,
    claimPointsMutation.error,
    completeTaskMutation.error
  ])

  // Loading states
  const isClaiming =
    completeTaskMutation.isPending ||
    claimPointsMutation.isPending ||
    claimRewardMutation.isPending ||
    isPendingWriteContract ||
    isPendingSwitchingChain

  let networkName = ''

  if (reward.chainName && reward.chain_id) {
    networkName = chainMap[reward.chain_id.toString()].chain?.name ?? ''
  }

  let alertProps = undefined

  if (claimError) {
    if (claimError instanceof WarningError) {
      alertProps = {
        showClose: false,
        title: claimError.title,
        message: claimError.message,
        variant: 'warning' as const
      }
    } else {
      alertProps = {
        showClose: false,
        title: t('quest.claimFailed', 'Claim failed'),
        message: t(
          'quest.claimFailedMessage',
          "Please try once more. If it still doesn't work, create a Discord support ticket."
        ),
        actionText: t('quest.createDiscordTicket', 'Create Discord Ticket'),
        onActionClick: () => openDiscordLink(),
        variant: 'danger' as const
      }
    }
  }

  return (
    <div className={styles.rewardContainer}>
      <RewardUi
        reward={{ ...reward, claimPending: isClaiming }}
        key={reward.title}
        onClaim={async () => onClaim(reward)}
        hideClaim={hideClaim}
      />
      {alertProps ? (
        <div className={styles.alertCard}>
          <AlertCard {...alertProps} />
        </div>
      ) : null}
      <ConfirmClaimModal
        isOpen={showWarning}
        onConfirm={() => {
          setShowWarning(false)
          claimRewardMutation.mutate(reward)
        }}
        onCancel={() => setShowWarning(false)}
        onClose={() => setShowWarning(false)}
        networkName={networkName}
      />
    </div>
  )
}
