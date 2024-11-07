import { QuestWrapperContextValue } from '@/types/quests'
import { useQueries } from '@tanstack/react-query'

export function useGetSteamGame(
  steam_games: {
    id: string
  }[],
  getSteamGameMetadata: QuestWrapperContextValue['getSteamGameMetadata']
) {
  const query = useQueries({
    queries: steam_games.map((val) => ({
      queryKey: ['getSteamGame', val.id],
      queryFn: async () => {
        const response = await getSteamGameMetadata(Number.parseInt(val.id))
        if (!response) return null
        return response as {
          name?: string
          capsule_image?: string
        }
      },
      staleTime: Infinity
    }))
  })

  return {
    data: query
  }
}
