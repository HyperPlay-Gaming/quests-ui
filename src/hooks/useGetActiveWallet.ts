import { QuestWrapperContextValue } from '@/types/quests'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

type UseGetActiveWalletProps = {
  getActiveWallet: QuestWrapperContextValue['getActiveWallet']
} & Omit<
  UseQueryOptions<
    Awaited<ReturnType<QuestWrapperContextValue['getActiveWallet']>>,
    Error
  >,
  'queryKey' | 'queryFn'
>

export function useGetActiveWallet({
  getActiveWallet,
  ...options
}: UseGetActiveWalletProps) {
  const { data: activeWallet } = useQuery({
    queryKey: ['activeWallet'],
    queryFn: async () => {
      return getActiveWallet()
    },
    ...options
  })

  return {
    activeWallet
  }
}
