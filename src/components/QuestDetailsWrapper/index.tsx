import React, { useEffect, useMemo, useState } from 'react'
import {
  Images,
  Button,
  Game,
  MarkdownDescription,
  QuestDetails,
  QuestDetailsProps,
  QuestDetailsTranslations
} from '@hyperplay/ui'
import styles from './index.module.scss'
import useGetQuest from '../../hooks/useGetQuest'
import useGetSteamGame from '../../hooks/useGetSteamGame'
import { useTranslation } from 'react-i18next'
import { useAccount, useConnect, useSwitchChain, useWriteContract } from 'wagmi'
import {
  Reward,
  RewardClaimSignature,
  ConfirmClaimParams,
  Runner,
  DepositContract,
  Quest
} from '@hyperplay/utils'
import { mintReward } from '../../helpers/mintReward'
import { resyncExternalTasks as resyncExternalTasksHelper } from '../../helpers/resyncExternalTask'
import useGetUserPlayStreak from '../../hooks/useGetUserPlayStreak'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getPlaystreakArgsFromQuestData } from '../../helpers/getPlaystreakArgsFromQuestData'
import { useGetRewards } from '../../hooks/useGetRewards'
import { chainMap, parseChainMetadataToViemChain } from '@hyperplay/chains'
import { InfoAlertProps } from '@hyperplay/ui/dist/components/AlertCard'
import { useTrackQuestViewed } from '../../hooks/useTrackQuestViewed'
import { ConfirmClaimModal } from '../ConfirmClaimModal'
import { getRewardClaimGasEstimation } from '@/helpers/getRewardClaimGasEstimation'
import { createPublicClient, http } from 'viem'
import { injected } from 'wagmi/connectors'
import { TrackEventFn } from '@/types/analytics'
import { TFunction } from 'i18next'
import cn from 'classnames'
import { useHasPendingExternalSync } from '@/hooks/useHasPendingExternalSync'
import { getGetQuestLogInfoQueryKey } from '@/helpers/getQueryKeys'

class ClaimError extends Error {
  properties: any

  constructor(message: string, properties: any) {
    super(message)
    this.properties = properties
  }
}

export interface QuestDetailsWrapperProps {
  className?: string
  selectedQuestId: number | null
  flags: {
    rewardTypeClaimEnabled: Record<Reward['reward_type'], boolean>
    questsOverlayClaimCtaEnabled?: boolean
  }
  getQuest: (questId: number) => any
  getUserPlayStreak: (questId: number) => any
  getSteamGameMetadata: (id: number) => any
  isSignedIn: boolean
  trackEvent: TrackEventFn
  signInWithSteamAccount: () => void
  openSignInModal: () => void
  logError: (msg: string) => void
  claimPoints: (reward: Reward) => Promise<any>
  completeExternalTask: (reward: Reward) => Promise<any>
  getQuestRewardSignature: (
    address: `0x${string}`,
    rewardId: number,
    tokenId?: number
  ) => Promise<RewardClaimSignature>
  getPendingExternalSync: (questId: number) => Promise<boolean>
  confirmRewardClaim: (params: ConfirmClaimParams) => Promise<void>
  syncPlayStreakWithExternalSource: (questId: number) => Promise<unknown>
  resyncExternalTask: (rewardId: string) => Promise<void>
  getExternalTaskCredits: (rewardId: string) => Promise<string>
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>
  logInfo: (message: string) => void
  openDiscordLink: () => void
  getDepositContracts: (questId: number) => Promise<DepositContract[]>
  tOverride?: TFunction<any, string>
  sessionEmail?: string
  checkG7ConnectionStatus: () => Promise<boolean>
  isQuestsPage?: boolean
  onPlayClick?: (quest: Quest) => void
  onRewardsClaimed?: (rewards: Reward[]) => void
}

export function QuestDetailsWrapper({
  className,
  selectedQuestId,
  flags,
  getQuest,
  getUserPlayStreak,
  getSteamGameMetadata,
  isSignedIn,
  trackEvent,
  signInWithSteamAccount,
  openSignInModal,
  logError,
  claimPoints,
  completeExternalTask,
  getQuestRewardSignature,
  confirmRewardClaim,
  resyncExternalTask,
  getExternalTaskCredits,
  getPendingExternalSync,
  logInfo,
  openDiscordLink,
  getDepositContracts,
  tOverride,
  sessionEmail,
  checkG7ConnectionStatus,
  isQuestsPage = false,
  syncPlayStreakWithExternalSource,
  onPlayClick,
  onRewardsClaimed
}: QuestDetailsWrapperProps) {
  const queryClient = useQueryClient()
  const [syncSuccess, setSyncSuccess] = useState(false)
  const rewardTypeClaimEnabled = flags.rewardTypeClaimEnabled
  const { writeContractAsync, isPending: isPendingWriteContract } =
    useWriteContract({
      mutation: {
        onError: (error) => {
          logError(`Error writing contract: ${error}`)
        }
      }
    })

  const { switchChainAsync, isPending: isPendingSwitchingChain } =
    useSwitchChain({
      mutation: {
        onError: (error) => {
          logError(`Error switching chain: ${error}`)
        }
      }
    })

  const [claimError, setClaimError] = useState<Error | null>(null)

  useTrackQuestViewed(selectedQuestId, trackEvent)

  const account = useAccount()
  const { connectAsync } = useConnect()
  const [showWarning, setShowWarning] = useState(false)
  const { t: tOriginal } = useTranslation()
  let t = tOriginal
  if (tOverride) {
    t = tOverride
  }
  const questResult = useGetQuest(selectedQuestId, getQuest)
  const [warningMessage, setWarningMessage] = useState<{
    title: string
    message: string
  }>()
  const questMeta = questResult.data.data

  const questPlayStreakResult = useGetUserPlayStreak(
    selectedQuestId,
    getUserPlayStreak
  )
  const questPlayStreakData = questPlayStreakResult.data.data

  const isEligible = useMemo(() => {
    if (!questMeta) {
      return false
    }

    const currentStreak = questPlayStreakData?.current_playstreak_in_days
    const requiredStreak =
      questMeta.eligibility?.play_streak?.required_playstreak_in_days

    if (questMeta.type === 'PLAYSTREAK' && currentStreak && requiredStreak) {
      return currentStreak >= requiredStreak
    }

    return false
  }, [questMeta, questPlayStreakData])

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
      claimRewardsMutation.mutate([reward])
    }
  }

  const rewardsQuery = useGetRewards({
    questId: selectedQuestId,
    getQuest,
    getExternalTaskCredits,
    logError
  })

  const questRewards = rewardsQuery.data.data

  const {
    data: hasPendingExternalSync,
    invalidateQuery: invalidateHasPendingExternalSync
  } = useHasPendingExternalSync({
    questId: selectedQuestId,
    getPendingExternalSync
  })

  const syncWithExternalSourceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedQuestId) {
        return
      }
      return syncPlayStreakWithExternalSource(selectedQuestId)
    },
    onSuccess: async () => {
      setSyncSuccess(true)
      await questPlayStreakResult.invalidateQuery()
      await invalidateHasPendingExternalSync()
      setTimeout(() => {
        setSyncSuccess(false)
      }, 3000)
    }
  })

  let streakRightSection = null

  if (hasPendingExternalSync) {
    streakRightSection = (
      <Button
        disabled={syncWithExternalSourceMutation.isPending}
        type="secondaryGradient"
        onClick={() => syncWithExternalSourceMutation.mutate()}
        size="small"
      >
        {t('quest.playstreak.sync', 'Sync Progress')}
      </Button>
    )
  }

  if (syncSuccess) {
    streakRightSection = (
      <div className={styles.syncSuccess}>
        <Images.Checkmark
          fill="var(--color-success-500)"
          width={18}
          height={18}
        />
        {t('quest.playstreak.syncSuccess', 'Progress synced')}
      </div>
    )
  }

  const resyncMutation = useMutation({
    mutationFn: async (rewards: Reward[]) => {
      const isConnectedToG7 = await checkG7ConnectionStatus()

      if (!isConnectedToG7) {
        setWarningMessage({
          title: t('quest.noG7ConnectionSync.title', 'No G7 account linked'),
          message: t(
            'quest.noG7ConnectionSync.message',
            `You need to have a Game7 account linked to ${
              sessionEmail ?? 'your email'
            } to resync your tasks.`,
            { email: sessionEmail ?? 'your email' }
          )
        })
        return
      }

      const result = await resyncExternalTasksHelper(
        rewards,
        resyncExternalTask
      )
      const queryKey = `useGetG7UserCredits`
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      return result
    },
    onError: (error) => {
      logError(`Error resyncing tasks: ${error}`)
    },
    onSuccess: async () => {
      await questPlayStreakResult.invalidateQuery()
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
            `You need to have a Game7 account linked to ${
              sessionEmail ?? 'your email'
            } to claim your rewards.`,
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
    onError: (error) => {
      logError(`Error resyncing tasks: ${error}`)
    },
    onSuccess: async (_data, reward) => {
      onRewardsClaimed?.([reward])
      await questPlayStreakResult.invalidateQuery()
    }
  })

  const onPlayClickHandler = () => {
    if (!questMeta) {
      console.error('questMeta is undefined')
      return
    }

    onPlayClick?.(questMeta)
  }

  const claimPointsMutation = useMutation({
    mutationFn: async (reward: Reward) => {
      const result = await claimPoints(reward)
      const queryKey = `getPointsBalancesForProject:${questMeta?.project_id}`
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      return result
    },
    onError: (error) => {
      logError(`Error claiming points: ${error}`)
    },
    onSuccess: async (_data, reward) => {
      onRewardsClaimed?.([reward])
      await questPlayStreakResult.invalidateQuery()
    }
  })

  const confirmClaimMutation = useMutation({
    mutationFn: async (params: ConfirmClaimParams) => {
      return confirmRewardClaim(params)
    },
    retry: 5,
    retryDelay: 1000,
    onSuccess: async () => {
      await questPlayStreakResult.invalidateQuery()
    },
    onError: (error, variables) => {
      logError(
        `Error confirming reward claim ${
          error.message
        }, variables: ${JSON.stringify({
          ...variables,
          address: account?.address
        })}`
      )
    }
  })

  let questDetails = null

  const getSteamGameResult = useGetSteamGame(
    questMeta?.eligibility?.steam_games ?? [],
    getSteamGameMetadata
  )

  const steamGames: Game[] =
    getSteamGameResult?.data?.map((val, index) => ({
      title: val.data?.name ?? index.toString(),
      imageUrl: val.data?.capsule_image ?? '',
      loading: val.isLoading || val.isFetching
    })) ?? []

  const [collapseIsOpen, setCollapseIsOpen] = useState(false)

  const hasMetStreak =
    (questPlayStreakData?.current_playstreak_in_days ?? 0) >=
    (questMeta?.eligibility?.play_streak?.required_playstreak_in_days ??
      Infinity)

  const showResyncButton =
    questMeta?.type === 'PLAYSTREAK' &&
    !hasMetStreak &&
    !!questPlayStreakData?.completed_counter &&
    !!questMeta?.rewards?.filter((val) => val.reward_type === 'EXTERNAL-TASKS')
      ?.length

  const i18n: QuestDetailsTranslations = {
    rewards: t('quest.reward', 'Rewards'),
    associatedGames: t('quest.associatedGames', 'Associated games'),
    linkSteamAccount: t(
      'quest.linkAccount',
      'Link your Steam account to check eligibility.'
    ),
    needMoreAchievements: t(
      'quest.needMoreAchievements',
      `You need to have completed {{percent}}% of the achievements in one of these games.`,
      { percent: questMeta?.eligibility?.completion_threshold ?? '??' }
    ),
    claim: t('quest.claim', 'Claim'),
    signIn: t('quest.signIn', 'Sign in'),
    connectSteamAccount: t(
      'quest.connectSteamAccount',
      'Connect Steam account'
    ),
    questType: {
      REPUTATION: t('quest.type.reputation', 'Reputation'),
      PLAYSTREAK: t('quest.type.playstreak', 'Play Streak')
    },
    sync: t('quest.sync', 'Sync'),
    streakProgressI18n: {
      sync: t('quest.playstreak.sync', 'Sync Progress'),
      streakProgress: t('quest.playstreak.streakProgress', 'Streak Progress'),
      days: t('quest.playstreak.days', 'days'),
      playToStart: t(
        'quest.playstreak.playToStart',
        'Play this game to start your streak!'
      ),
      playEachDay: t(
        'quest.playstreak.playEachDay',
        `Play each day so your streak won't reset!`
      ),
      streakCompleted: t(
        'quest.playstreak.streakCompleted',
        'Streak completed! Claim your rewards now.'
      ),
      now: t('quest.playstreak.now', 'Now'),
      dayResets: t('quest.playstreak.dayResets', 'Day resets:'),
      progressTowardsStreak: t(
        'quest.playstreak.progressTowardsStreak',
        `progress towards today's streak.`
      )
    }
  }

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

    const walletBalance = await publicClient.getBalance({
      address
    })

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

    // awaiting is fine for now because we're doing a single write contract at a time,
    // but we might want to not block the UI thread when we implement multiple claims
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

  async function claimRewards(rewards: Reward[]) {
    for (const reward_i of rewards) {
      const isRewardTypeClaimable = rewardTypeClaimEnabled[reward_i.reward_type]
      if (selectedQuestId === null || !isRewardTypeClaimable) {
        continue
      }
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        amount_per_user,
        chain_id,
        marketplace_url,
        decimals,
        ...rewardToTrack_i
      } = reward_i
      /* eslint-enable @typescript-eslint/no-unused-vars */
      const properties = {
        ...rewardToTrack_i,
        quest_id: selectedQuestId.toString()
      }
      trackEvent({
        event: 'Reward Claim Started',
        properties
      })

      try {
        setWarningMessage(undefined)
        switch (reward_i.reward_type) {
          case 'ERC1155':
          case 'ERC721':
          case 'ERC20':
            await mintOnChainReward(reward_i)
            break
          case 'POINTS':
            await claimPointsMutation.mutateAsync(reward_i)
            break
          case 'EXTERNAL-TASKS':
            await completeTaskMutation.mutateAsync(reward_i)
            break
          default:
            logError(`unknown reward type ${reward_i.reward_type}`)
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
  }

  const claimRewardsMutation = useMutation({
    mutationFn: async (params: Reward[]) => {
      return claimRewards(params)
    },
    onSuccess: async (_data, rewards) => {
      onRewardsClaimed?.(rewards)
      await questPlayStreakResult.invalidateQuery()
      if (selectedQuestId !== null) {
        await queryClient.invalidateQueries({
          queryKey: [getGetQuestLogInfoQueryKey(selectedQuestId.toString())]
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
  const chainTooltips: Record<string, string> = {}
  chainTooltips[t('quest.points', 'Points')] =
    'Points are off-chain fungible rewards that may or may not be redeemable for an on-chain reward in the future. This is up to the particular game developer who is providing this reward.'

  const isClaiming =
    completeTaskMutation.isPending ||
    claimPointsMutation.isPending ||
    claimRewardsMutation.isPending ||
    isPendingWriteContract ||
    isPendingSwitchingChain

  useEffect(() => {
    setWarningMessage(undefined)
    setClaimError(null)
  }, [selectedQuestId])

  useEffect(() => {
    const error =
      claimRewardsMutation.error ||
      claimPointsMutation.error ||
      completeTaskMutation.error

    setClaimError(error)
  }, [
    claimRewardsMutation.error,
    claimPointsMutation.error,
    completeTaskMutation.error
  ])

  if (selectedQuestId !== null && questMeta && questRewards) {
    const isRewardTypeClaimable = Boolean(
      questMeta?.rewards?.some(
        (reward) => rewardTypeClaimEnabled[reward.reward_type]
      )
    )

    const logMsg = ` 
      isClaiming: ${isClaiming} 
      flag: ${flags.questsOverlayClaimCtaEnabled},
      is eligible: ${isEligible},
      show resync button: ${showResyncButton},
      is signed in: ${isSignedIn},
      is reward claimable ${isRewardTypeClaimable}`
    logInfo(logMsg)

    let alertProps: InfoAlertProps | undefined

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
        variant: 'danger'
      }
    }

    if (warningMessage) {
      alertProps = {
        showClose: false,
        title: warningMessage.title,
        message: warningMessage.message,
        variant: 'warning'
      }
    }

    let networkName = ''

    if (questMeta.rewards?.[0].chain_id) {
      networkName = chainMap[questMeta.rewards[0].chain_id]?.chain?.name ?? ''
    }

    const rewardsToClaim = questMeta.rewards ?? []

    const questDetailsProps: QuestDetailsProps = {
      className,
      alertProps,
      onPlayClick: onPlayClickHandler,
      questType: questMeta.type,
      title: questMeta.name,
      description: (
        <MarkdownDescription classNames={{ root: styles.markdownDescription }}>
          {questMeta.description}
        </MarkdownDescription>
      ),
      eligibility: {
        reputation: {
          games: steamGames,
          completionPercent: questMeta.eligibility?.completion_threshold ?? 100,
          eligible: false,
          steamAccountLinked: true
        },
        playStreak: getPlaystreakArgsFromQuestData({
          standby: isQuestsPage,
          questMeta,
          questPlayStreakData,
          useModuleInitTimeForSessionStartTime: isSignedIn,
          rightSection: streakRightSection
        })
      },
      rewards: questRewards.map((reward) => ({
        ...reward,
        onClaim: async () => onClaim(reward.apiReward),
        claimPending: isClaiming
      })),
      onSignInClick: openSignInModal,
      onConnectSteamAccountClick: signInWithSteamAccount,
      collapseIsOpen,
      toggleCollapse: () => setCollapseIsOpen(!collapseIsOpen),
      isSignedIn,
      ctaDisabled: false,
      showSync: showResyncButton,
      onSyncClick: () => {
        resyncMutation.mutateAsync(questMeta.rewards ?? [])
      },
      isSyncing: resyncMutation.isPending,
      chainTooltips: {},
      isQuestsPage,
      i18n
    }
    questDetails = (
      <>
        <ConfirmClaimModal
          isOpen={showWarning}
          onConfirm={() => {
            setShowWarning(false)
            claimRewardsMutation.mutate(rewardsToClaim)
          }}
          onCancel={() => setShowWarning(false)}
          onClose={() => setShowWarning(false)}
          networkName={networkName}
        />
        <QuestDetails
          {...questDetailsProps}
          className={cn(styles.questDetails, questDetailsProps.className)}
          key={`questDetailsLoadedId${
            questMeta.id
          }streak${!!questPlayStreakData}isSignedIn${!!isSignedIn}`}
        />
      </>
    )
  } else if (
    questResult?.data.isLoading ||
    questResult?.data.isFetching ||
    rewardsQuery?.data.isLoading
  ) {
    const emptyQuestDetailsProps: QuestDetailsProps = {
      className,
      questType: 'PLAYSTREAK',
      title: '',
      description: '',
      eligibility: {
        reputation: {
          games: [],
          completionPercent: 0,
          eligible: false,
          steamAccountLinked: false
        },
        playStreak: {
          standby: isQuestsPage,
          currentStreakInDays: 0,
          requiredStreakInDays: 1,
          minimumSessionTimeInSeconds: 100,
          accumulatedPlaytimeTodayInSeconds: 0,
          lastPlaySessionCompletedDateTimeUTC: new Date().toISOString()
        }
      },
      rewards: [],
      onSignInClick: () => console.log('sign in clicked for ', questMeta?.name),
      onConnectSteamAccountClick: () =>
        console.log('connect steam account clicked for ', questMeta?.name),
      collapseIsOpen,
      toggleCollapse: () => setCollapseIsOpen(!collapseIsOpen),
      isSignedIn,
      isQuestsPage,
      i18n
    }
    questDetails = (
      <QuestDetails
        {...emptyQuestDetailsProps}
        className={cn(styles.questDetails, emptyQuestDetailsProps.className)}
        ctaDisabled={true}
        key={'questDetailsLoading'}
      />
    )
  }

  return questDetails
}
