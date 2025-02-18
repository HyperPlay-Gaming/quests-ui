import { useQuery } from '@tanstack/react-query'

export function useGetGameNameByProjectId(projectId: string) {
  return useQuery({
    queryKey: ['game-name', projectId],
    queryFn: async () => {
      if (!projectId) return null
      const response = await fetch(
        `https://developers.hyperplay.xyz/api/v1/listings/${projectId}`
      )
      if (!response.ok) {
        throw await response.text()
      }
      return response.json()
    },
    enabled: !!projectId
  })
}
