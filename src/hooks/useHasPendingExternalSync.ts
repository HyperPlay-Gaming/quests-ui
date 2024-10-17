import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

export function useHasPendingExternalSync({
  questId,
  getPendingExternalSync
}: {
  questId: number | null
  getPendingExternalSync: (questId: number) => Promise<boolean>
}) {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const queryKey = ['pending-external-sync', questId, address]
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!questId) {
        return false
      }
      return getPendingExternalSync(questId)
    },
    enabled: questId !== undefined
  })

  return {
    ...query,
    invalidateQuery: async () => queryClient.invalidateQueries({ queryKey })
  }
}
