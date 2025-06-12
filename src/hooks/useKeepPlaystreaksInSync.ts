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
    console.log(`[PlaystreakSync] Starting sync initialization for app: ${appName}`)
    
    const initSync = async () => {
      try {
        console.log(`[PlaystreakSync] Initializing sync state for app: ${appName}`)
        questPlayStreakSyncState.init({
          getQuests,
          getQuest,
          getUserPlayStreak,
          syncPlaySession,
          appQueryClient: queryClient
        })

        console.log(`[PlaystreakSync] Starting project quest sync for app: ${appName}`)
        await questPlayStreakSyncState.keepProjectQuestsInSync(appName, runner)
        syncInitializedRef.current = true
        console.log(`[PlaystreakSync] Successfully initialized sync for app: ${appName}`)
      } catch (error) {
        console.error(`[PlaystreakSync] Failed to initialize sync for app ${appName}:`, error)
      }
    }
    initSync()

    return () => {
      if (syncInitializedRef.current) {
        console.log(`[PlaystreakSync] Cleaning up sync timers for app: ${appName}`)
        questPlayStreakSyncState.clearAllTimers()
        console.log(`[PlaystreakSync] Successfully cleaned up sync timers for app: ${appName}`)
      }
    }
  }, [appName])
}
