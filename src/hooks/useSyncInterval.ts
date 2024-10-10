import { resetSessionStartedTime } from '@/helpers/getPlaystreakArgsFromQuestData'
import { Runner, wait } from '@hyperplay/utils'
import { useEffect } from 'react'

export function useSyncPlaySession(
  projectId: string,
  invalidateQuery: () => Promise<void>,
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>,
  minimumRequiredPlayTimeInSeconds?: number,
  currentPlayTimeInSeconds?: number
) {
  useEffect(() => {
    async function sync(){
      await syncPlaySession(projectId, 'hyperplay')
      // allow for some time before read
      await wait(5000)
      await invalidateQuery()
      resetSessionStartedTime()
    }
    const syncTimer = setInterval(sync, 1000 * 60)

    let finalSyncTimer: NodeJS.Timeout | undefined = undefined
    if (minimumRequiredPlayTimeInSeconds && currentPlayTimeInSeconds && currentPlayTimeInSeconds < minimumRequiredPlayTimeInSeconds){
      finalSyncTimer = setTimeout(sync, minimumRequiredPlayTimeInSeconds - currentPlayTimeInSeconds)
    }

    return () => {
      clearInterval(syncTimer)
      if (finalSyncTimer){
        clearTimeout(finalSyncTimer)
      }
    }
  }, [projectId, invalidateQuery])
}
