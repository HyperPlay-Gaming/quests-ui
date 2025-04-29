import React, { useState } from 'react'
import {
  MarkdownDescription,
  QuestDetails,
  QuestDetailsProps,
  QuestDetailsTranslations,
  LoadingSpinner,
  DarkContainer
} from '@hyperplay/ui'
import styles from './index.module.scss'
import { useGetQuest } from '../../hooks/useGetQuest'
import { useTranslation } from 'react-i18next'
import { Reward } from '@hyperplay/utils'
import { resyncExternalTasks as resyncExternalTasksHelper } from '../../helpers/resyncExternalTask'
import { useGetUserPlayStreak } from '../../hooks/useGetUserPlayStreak'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InfoAlertProps } from '@hyperplay/ui/dist/components/AlertCard'
import { useTrackQuestViewed } from '../../hooks/useTrackQuestViewed'
import cn from 'classnames'
import { QuestWrapperProvider } from '@/state/QuestWrapperProvider'
import { RewardsWrapper } from '../RewardsWrapper'
import { QuestWrapperContextValue } from '@/types/quests'
import { useGetActiveWallet } from '@/hooks/useGetActiveWallet'
import { Eligibility } from '../Eligibility'
import { useAccount } from 'wagmi'
import { useGetGameNameByProjectId } from '../../hooks/useGetGameNameByProjectId'

export interface QuestDetailsWrapperProps extends QuestWrapperContextValue {
  selectedQuestId: number | null
  className?: string
  ctaComponent?: React.ReactNode
  hideEligibilitySection?: boolean
  hideClaim?: boolean
  streakIsProgressing?: boolean
  classNames?:  QuestDetailsProps['classNames']
}

export function QuestDetailsWrapper(props: QuestDetailsWrapperProps) {
  const {
    selectedQuestId,
    trackEvent,
    getQuest,
    getUserPlayStreak,
    logError,
    tOverride,
    sessionEmail,
    checkG7ConnectionStatus,
    resyncExternalTask,
    onPlayClick,
    openSignInModal,
    signInWithSteamAccount,
    isQuestsPage,
    isSignedIn,
    className,
    ctaComponent,
    hideEligibilitySection,
    hideClaim,
    flags,
    getActiveWallet
  } = props

  const { connector } = useAccount()
  const queryClient = useQueryClient()

  const [warningMessage, setWarningMessage] = useState<{
    title: string
    message: string
  }>()

  const gameplayWalletSectionVisible = Boolean(
    flags.gameplayWalletSectionVisible
  )

  useTrackQuestViewed(selectedQuestId, trackEvent)

  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  const questResult = useGetQuest(selectedQuestId, getQuest)
  const questMeta = questResult.data?.data
  const projectId = questMeta?.project_id

  const { data: listingsFromHook, isLoading: isListingsLoading } =
    useGetGameNameByProjectId(projectId ?? '')

  const { activeWallet } = useGetActiveWallet({
    getActiveWallet,
    enabled: isSignedIn
  })

  const gameName = projectId && listingsFromHook?.project_meta?.name

  const questPlayStreakResult = useGetUserPlayStreak(
    selectedQuestId,
    getUserPlayStreak
  )
  const questPlayStreakData = questPlayStreakResult.data.data?.userPlayStreak

  const onPlayClickHandler = () => {
    if (!questMeta) {
      console.error('questMeta is undefined')
      return
    }

    onPlayClick(questMeta)
  }

  let questDetails = null

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
      logError(`Error resyncing tasks: ${error}`, {
        sentryException: error,
        sentryExtra: {
          questId: selectedQuestId,
          error: error,
          connector: String(connector?.name)
        },
        sentryTags: {
          action: 'resync_external_tasks',
          feature: 'quests'
        }
      })
    },
    onSuccess: async () => {
      await questPlayStreakResult.invalidateQuery()
    }
  })

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
    endsOn: t('quest.endsOn', 'Quest ends'),
    endedOn: t('quest.endedOn', 'Quest ended'),
    rewards: t('quest.reward', 'Rewards'),
    claim: t('quest.claim', 'Claim'),
    signIn: t('quest.signIn', 'Sign in'),
    connectSteamAccount: t(
      'quest.connectSteamAccount',
      'Connect Steam account'
    ),
    questType: {
      REPUTATION: t('quest.type.reputation', 'Reputation'),
      PLAYSTREAK: t('quest.type.playstreak', 'Play Streak'),
      GAME: gameName
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

  const chainTooltips: Record<string, string> = {}

  chainTooltips[t('quest.points', 'Points')] =
    'Points are off-chain fungible rewards that may or may not be redeemable for an on-chain reward in the future. This is up to the particular game developer who is providing this reward.'

  if (selectedQuestId !== null && questMeta) {
    let alertProps: InfoAlertProps | undefined

    if (warningMessage) {
      alertProps = {
        showClose: false,
        title: warningMessage.title,
        message: warningMessage.message,
        variant: 'warning'
      }
    }

    let ctaDisabled = false

    // ** Decision Matrix **
    // If the quest is on the quests page, and the user is not signed in, the cta is disabled
    // If the quest is on the quests page, and the user is signed but there is no active wallet, the cta is disabled
    // If the quest is not on the quests page (e.g. in the overlay), the cta is enabled
    if (isQuestsPage) {
      if (!isSignedIn) {
        ctaDisabled = true
      } else if (gameplayWalletSectionVisible && !activeWallet) {
        ctaDisabled = true
      }
    }

    const questDetailsProps: QuestDetailsProps = {
      className,
      alertProps,
      onPlayClick: onPlayClickHandler,
      gameTitle: gameName || '',
      questType: questMeta.type,
      endDate: questMeta.end_date,
      title: questMeta.name,
      description: (
        <MarkdownDescription classNames={{ root: styles.markdownDescription }}>
          {questMeta.description}
        </MarkdownDescription>
      ),
      onSignInClick: openSignInModal,
      onConnectSteamAccountClick: signInWithSteamAccount,
      ctaDisabled,
      showSync: showResyncButton,
      onSyncClick: () => {
        resyncMutation.mutateAsync(questMeta.rewards ?? [])
      },
      isSyncing: resyncMutation.isPending,
      isQuestsPage,
      i18n,
      isSignedIn,
      eligibilityComponent: hideEligibilitySection ? null : (
        <Eligibility quest={questMeta} {...props} />
      ),
      rewardsComponent: (
        <RewardsWrapper questId={selectedQuestId} hideClaim={hideClaim} />
      ),
      ctaComponent,
      classNames: props.classNames
    }
    questDetails = (
      <QuestDetails
        {...questDetailsProps}
        className={cn(styles.questDetails, questDetailsProps.className)}
        key={`questDetailsLoadedId${
          questMeta.id
        }streak${!!questPlayStreakData}isSignedIn${!!isSignedIn}`}
      />
    )
  } else if (
    questResult.isLoading ||
    questPlayStreakResult?.isLoading ||
    isListingsLoading
  ) {
    questDetails = (
      <DarkContainer className={cn(styles.loadingContainer, className)}>
        <LoadingSpinner
          className={styles.loadingSpinner}
          aria-label="loading quest details"
        />
      </DarkContainer>
    )
  }

  return <QuestWrapperProvider {...props}>{questDetails}</QuestWrapperProvider>
}
