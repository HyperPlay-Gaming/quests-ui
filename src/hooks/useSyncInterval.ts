import { resetSessionStartedTime } from '@/helpers/getPlaystreakArgsFromQuestData'
import { Runner } from '@hyperplay/utils'
import { useEffect } from 'react'
import { useInterval } from './useInterval'

export function useSyncPlaySession({
  projectId,
  invalidateQuery,
  syncPlaySession,
  minimumRequiredPlayTimeInSeconds,
  currentPlayTimeInSeconds,
  runner
}: {
  projectId: string
  invalidateQuery: () => Promise<void>
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>
  minimumRequiredPlayTimeInSeconds?: number
  currentPlayTimeInSeconds?: number
  runner: Runner
}) {
  async function sync() {
    await syncPlaySession(projectId, runner ?? 'hyperplay')
    await invalidateQuery()
    resetSessionStartedTime()
  }
  useInterval(sync, 60000)

  useEffect(() => {
    let finalSyncTimer: NodeJS.Timeout | undefined = undefined
    if (
      minimumRequiredPlayTimeInSeconds &&
      currentPlayTimeInSeconds &&
      currentPlayTimeInSeconds < minimumRequiredPlayTimeInSeconds
    ) {
      finalSyncTimer = setTimeout(
        sync,
        minimumRequiredPlayTimeInSeconds - currentPlayTimeInSeconds
      )
    }

    return () => {
      if (finalSyncTimer) {
        clearTimeout(finalSyncTimer)
      }
    }
  }, [projectId, invalidateQuery])
}
