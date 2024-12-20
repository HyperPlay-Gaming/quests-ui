import { getPlaystreakArgsFromQuestData } from '@/helpers/getPlaystreakArgsFromQuestData'
import { useGetQuest } from '@/hooks/useGetQuest'
import { useGetUserPlayStreak } from '@/hooks/useGetUserPlayStreak'
import { useHasPendingExternalSync } from '@/hooks/useHasPendingExternalSync'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import { Button, Images, StreakProgress } from '@hyperplay/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './index.module.scss'
import { useAccount } from 'wagmi'
import ActiveWalletSection from '../ActiveWalletSection'

export function PlayStreakEligibilityWrapper({
  questId
}: {
  questId: number | null
}) {
  const queryClient = useQueryClient()

  const {
    syncPlayStreakWithExternalSource,
    getPendingExternalSync,
    getUserPlayStreak,
    getQuest,
    getActiveWallet,
    setActiveWallet
  } = useQuestWrapper()
  const { t } = useTranslation()
  const { data: questMeta } = useGetQuest(questId, getQuest)
  const { address } = useAccount()

  const { data: activeWallet } = useQuery({
    queryKey: ['activeWallet'],
    queryFn: async () => {
      return getActiveWallet()
    }
  })

  const { mutateAsync: setActiveWalletMutation } = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error('No address found')
      }

      await setActiveWallet(address)
      await invalidateQuestPlayStreak()
      await queryClient.invalidateQueries({
        queryKey: ['activeWallet']
      })
    }
  })

  const {
    data: questPlayStreakData,
    invalidateQuery: invalidateQuestPlayStreak
  } = useGetUserPlayStreak(questId, getUserPlayStreak)

  const [syncSuccess, setSyncSuccess] = useState(false)

  const {
    data: hasPendingExternalSync,
    invalidateQuery: invalidateHasPendingExternalSync
  } = useHasPendingExternalSync({
    questId,
    getPendingExternalSync
  })

  const syncWithExternalSourceMutation = useMutation({
    mutationFn: async () => {
      if (!questId) {
        return
      }
      return syncPlayStreakWithExternalSource(questId)
    },
    onSuccess: async () => {
      setSyncSuccess(true)
      await invalidateQuestPlayStreak()
      await invalidateHasPendingExternalSync()
      setTimeout(() => {
        setSyncSuccess(false)
      }, 3000)
    }
  })

  if (!questMeta || !questPlayStreakData) {
    return null
  }

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

  if (!questMeta.data) {
    return null
  }

  const dateTimeCurrentSessionStartedInMsSinceEpoch =
    questPlayStreakData.dataUpdatedAt ?? Date.now()

  return (
    <div className={styles.container}>
      <ActiveWalletSection
        connectedWallet={address ?? null}
        activeWallet={activeWallet ?? null}
        setActiveWallet={setActiveWalletMutation}
      />
      <StreakProgress
        {...getPlaystreakArgsFromQuestData({
          questMeta: questMeta.data,
          questPlayStreakData: questPlayStreakData.data?.userPlayStreak,
          dateTimeCurrentSessionStartedInMsSinceEpoch,
          rightSection: streakRightSection
        })}
      />
    </div>
  )
}
