import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Quest, Runner } from '@hyperplay/utils'
import { QuestDetailsWrapperProps } from '@/components/QuestDetailsWrapper'
import questPlayStreakSyncState from '@/state/QuestPlayStreakSyncState'

export function useKeepPlaystreaksInSync({
  appName,
  runner,
  getQuest,
  getUserPlayStreak,
  getQuests,
  syncPlaySession
}: {
  appName: string
  runner: Runner
  getQuest: QuestDetailsWrapperProps['getQuest']
  getUserPlayStreak: QuestDetailsWrapperProps['getUserPlayStreak']
  getQuests: (projectId?: string) => Promise<Quest[]>
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>
}) {
  const syncInitializedRef = useRef(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const initSync = async () => {
      try {
        questPlayStreakSyncState.init({
          getQuests,
          getQuest,
          getUserPlayStreak,
          syncPlaySession,
          appQueryClient: queryClient
        })

        await questPlayStreakSyncState.keepProjectQuestsInSync(appName, runner)
        syncInitializedRef.current = true
      } catch (error) {
        console.error('Failed to initialize sync:', error)
      }
    }
    initSync()

    return () => {
      if (syncInitializedRef.current) {
        questPlayStreakSyncState.clearAllTimers()
      }
    }
  }, [appName])
}
