import { useMutation, UseMutationOptions } from '@tanstack/react-query'

type MutationParams = {
  questId: number
  address: string
}

interface UseSyncPlayStreakProps {
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
  mutationOptions?: Omit<
    UseMutationOptions<unknown, Error, MutationParams>,
    'mutationFn'
  >
}

export const useSyncPlayStreak = ({
  getCSRFToken,
  syncPlayStreakWithExternalSource,
  checkPendingSync,
  signMessage,
  mutationOptions = {}
}: UseSyncPlayStreakProps) => {
  return useMutation({
    mutationFn: async ({ questId, address }: MutationParams) => {
      let hasPendingSync = false

      try {
        hasPendingSync = await checkPendingSync({ wallet: address, questId })
      } catch (error) {
        console.error('Error checking pending sync', error)
      }

      if (!hasPendingSync) {
        return
      }

      const csrfToken = await getCSRFToken()
      const message = `Sync play-streak of quest with ID: ${questId} \n\nNonce: ${csrfToken}`
      const signature = await signMessage(message)

      await syncPlayStreakWithExternalSource({
        quest_id: questId,
        signature
      })
    },
    ...mutationOptions
  })
}
