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
import { PlayStreakEligibilityWrapper } from '../PlayStreakEligibilityWrapper'
import { RewardsWrapper } from '../RewardsWrapper'
import { QuestWrapperContextValue } from '@/types/quests'

export interface QuestDetailsWrapperProps extends QuestWrapperContextValue {
  selectedQuestId: number | null
  className?: string
  ctaComponent?: React.ReactNode
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
    questSSR
  } = props

  const queryClient = useQueryClient()

  const [warningMessage, setWarningMessage] = useState<{
    title: string
    message: string
  }>()

  useTrackQuestViewed(selectedQuestId, trackEvent)

  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  const questResult = useGetQuest(selectedQuestId, getQuest, !!questSSR)
  const questMeta = questSSR ?? questResult.data?.data

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
      logError(`Error resyncing tasks: ${error}`)
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
    rewards: t('quest.reward', 'Rewards'),
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
      onSignInClick: openSignInModal,
      onConnectSteamAccountClick: signInWithSteamAccount,
      ctaDisabled: false,
      showSync: showResyncButton,
      onSyncClick: () => {
        resyncMutation.mutateAsync(questMeta.rewards ?? [])
      },
      isSyncing: resyncMutation.isPending,
      isQuestsPage,
      i18n,
      isSignedIn,
      eligibilityComponent: (
        <PlayStreakEligibilityWrapper questId={selectedQuestId} />
      ),
      rewardsComponent: <RewardsWrapper questId={selectedQuestId} />,
      ctaComponent
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
    questResult?.isLoading ||
    questPlayStreakResult?.isLoading
  ) {
    questDetails = (
      <DarkContainer className={cn(styles.loadingContainer, className)}>
        <LoadingSpinner className={styles.loadingSpinner} />
      </DarkContainer>
    )
  }

  return <QuestWrapperProvider {...props}>{questDetails}</QuestWrapperProvider>
}
