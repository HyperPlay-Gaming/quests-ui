import { getPlaystreakQuestStatus } from '@/helpers/getPlaystreakQuestStatus'
import { getGetQuestLogInfoQueryKey } from '@/helpers/getQueryKeys'
import { getRewardClaimGasEstimation } from '@/helpers/getRewardClaimGasEstimation'
import { mintReward } from '@/helpers/mintReward'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { ClaimError, UseGetRewardsData } from '@/types/quests'
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
import { createPublicClient, http } from 'viem'
import { useAccount, useConnect, useSwitchChain, useWriteContract } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ConfirmClaimModal } from '../ConfirmClaimModal'
import styles from './index.module.scss'

interface RewardWrapperProps {
  reward: UseGetRewardsData
  questId: number | null
  questMeta: Quest
  questPlayStreakData: UserPlayStreak | undefined | null
  invalidateQuestPlayStreakQuery: () => Promise<void>
}

export function RewardWrapper({
  reward,
  questId,
  questMeta,
  questPlayStreakData,
  invalidateQuestPlayStreakQuery
}: RewardWrapperProps) {
  const queryClient = useQueryClient()
  const { t: tOriginal } = useTranslation()
  const account = useAccount()
  const { connectAsync } = useConnect()

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
    onRewardsClaimed,
    claimPoints,
    checkG7ConnectionStatus,
    completeExternalTask,
    openDiscordLink
  } = useQuestWrapper()

  // State
  const [showWarning, setShowWarning] = useState(false)
  const [claimError, setClaimError] = useState<Error | null>(null)
  const [warningMessage, setWarningMessage] = useState<{
    title: string
    message: string
  }>()

  // Contract interactions
  const { writeContractAsync, isPending: isPendingWriteContract } =
    useWriteContract({
      mutation: {
        onError: (error) => logError(`Error writing contract: ${error}`)
      }
    })

  const {
    switchChainAsync,
    isPending: isPendingSwitchingChain,
    error: switchChainError
  } = useSwitchChain({
    mutation: {
      onError: (error) => logError(`Error switching chain: ${error}`)
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

  // Mutations
  const claimRewardMutation = useMutation({
    mutationFn: async (params: Reward) => claimReward(params),
    onSuccess: async (_data, rewards) => {
      onRewardsClaimed?.([rewards])
      await invalidateQuestPlayStreakQuery()
      if (questId !== null) {
        await queryClient.invalidateQueries({
          queryKey: [getGetQuestLogInfoQueryKey(questId.toString())]
        })
      }
    },
    onError: (error) => {
      if (error instanceof ClaimError) {
        trackEvent({
          event: 'Reward Claim Error',
          properties: error.properties
        })
      }
      console.error('Error claiming rewards:', error)
      logError(`Error claiming rewards: ${error}`)
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
        )}`
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
    onError: (error) => logError(`Error claiming points: ${error}`),
    onSuccess: async (_data, reward) => {
      onRewardsClaimed?.([reward])
      await invalidateQuestPlayStreakQuery()
    }
  })

  const completeTaskMutation = useMutation({
    mutationFn: async (reward: Reward) => {
      const isConnectedToG7 = await checkG7ConnectionStatus()

      if (!isConnectedToG7) {
        setWarningMessage({
          title: t('quest.noG7ConnectionSync.title', 'No G7 account linked'),
          message: t(
            'quest.noG7ConnectionSync.message',
            `You need to have a Game7 account linked to ${sessionEmail ?? 'your email'} to claim your rewards.`,
            { email: sessionEmail ?? 'your email' }
          )
        })
        return
      }

      const result = await completeExternalTask(reward)
      const queryKey = `useGetG7UserCredits`
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      return result
    },
    onError: (error) => logError(`Error resyncing tasks: ${error}`),
    onSuccess: async (_data, reward) => {
      onRewardsClaimed?.([reward])
      await invalidateQuestPlayStreakQuery()
    }
  })

  // Handlers
  const mintOnChainReward = async (reward: Reward) => {
    setWarningMessage(undefined)

    if (questMeta?.id === undefined) {
      throw Error('tried to mint but quest meta id is undefined')
    }

    if (reward.chain_id === null) {
      throw Error('chain id is not set for reward when trying to mint')
    }

    let address: `0x${string}` | undefined

    if (account.address) {
      address = account.address
    } else {
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
      setWarningMessage({
        title: t('quest.notEnoughBalance.title', 'Low balance'),
        message: t(
          'quest.notEnoughGas.message',
          'Insufficient wallet balance to claim your reward due to gas fees. Try a different wallet or replenish this one before retrying.'
        )
      })
      return
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
      logError
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
      logInfo(`reward type ${reward.reward_type} is not claimable`)
      return
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      amount_per_user,
      chain_id,
      marketplace_url,
      decimals,
      ...rewardToTrack_i
    } = reward
    const properties = {
      ...rewardToTrack_i,
      quest_id: questId.toString()
    }

    trackEvent({
      event: 'Reward Claim Started',
      properties
    })

    try {
      setWarningMessage(undefined)
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
          logError(`unknown reward type ${reward.reward_type}`)
          break
      }
    } catch (err) {
      throw new ClaimError(`${err}`, properties)
    }

    trackEvent({
      event: 'Reward Claim Success',
      properties
    })
  }

  const onClaim = async (reward: Reward) => {
    if (!isSignedIn) {
      setWarningMessage({
        title: t('quest.notSignedIn.title', 'Not signed in'),
        message: t(
          'quest.notSignedIn.message',
          'You need to be signed in to claim your reward.'
        )
      })
      return
    }

    if (!isEligible) {
      setWarningMessage({
        title: t('quest.notEligible.title', 'Not eligible yet'),
        message: t(
          'quest.notEligible.message',
          'You have not completed the required play streak days and can not claim your reward at this time.'
        )
      })
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
    setWarningMessage(undefined)
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

  if (warningMessage) {
    alertProps = {
      showClose: false,
      title: warningMessage.title,
      message: warningMessage.message,
      variant: 'warning' as const
    }
  }

  return (
    <div className={styles.rewardContainer}>
      <RewardUi
        reward={{ ...reward, claimPending: isClaiming }}
        key={reward.title}
        onClaim={async () => onClaim(reward)}
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