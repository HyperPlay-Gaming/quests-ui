import { useMutation } from '@tanstack/react-query'

interface UseSyncPlayStreakProps {
  refreshPlayStreak: () => void
  getCSRFToken: () => Promise<string>
  syncPlayStreakWithExternalSource: (params: {
    quest_id: number
    signature: string
  }) => Promise<unknown>
  checkPendingSync: (params: {
    wallet: string
    questId: number
  }) => Promise<boolean>
  signMessage: (message: string) => Promise<string>
  logInfo?: (message: string) => void
  logError?: (message: string) => void
}

export const useSyncPlayStreak = ({
  refreshPlayStreak,
  getCSRFToken,
  syncPlayStreakWithExternalSource,
  logInfo,
  logError,
  checkPendingSync,
  signMessage
}: UseSyncPlayStreakProps) => {
  return useMutation({
    mutationFn: async ({
      questId,
      address,
      questsWithExternalSync
    }: {
      questId: number
      address: string
      questsWithExternalSync: number[]
    }) => {
      let hasPendingSync = false

      try {
        hasPendingSync = await checkPendingSync({ wallet: address, questId })
      } catch (error) {
        console.error('Error checking pending sync', error)
      }

      if (questsWithExternalSync.includes(questId) && hasPendingSync) {
        const csrfToken = await getCSRFToken()
        const message = `Sync play-streak of quest with ID: ${questId} \n\nNonce: ${csrfToken}`
        const signature = await signMessage(message)

        await syncPlayStreakWithExternalSource({
          quest_id: questId,
          signature
        })
      }
    },
    onSuccess: async () => {
      refreshPlayStreak()
      console.log('Playstreak synced with external source')
      logInfo?.('Playstreak synced with external source')
    },
    onError: (error) => {
      console.error(`Error syncing playstreak with external source`, error)
      logError?.(
        `Error syncing playstreak with external source: ${error.message}`
      )
    }
  })
}
