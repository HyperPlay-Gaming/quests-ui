import { QuestLogInfo } from '@hyperplay/ui'
import { Quest, UserPlayStreak, ExternalEligibility } from '@hyperplay/utils'
import { useQueries } from '@tanstack/react-query'
import { getQuestQueryOptions } from './useGetQuest'
import { getUserPlaystreakQueryOptions } from './useGetUserPlayStreak'
import { getExternalEligibilityQueryOptions } from './useGetExternalEligibility'
import { getPlaystreakQuestStatus } from '@/helpers/getPlaystreakQuestStatus'
import { getExternalQuestStatus } from '@/helpers/getExternalQuestStatus'

type getQuestQueryOptionsType = ReturnType<typeof getQuestQueryOptions>
type getUserPlaystreakQueryOptionsType = ReturnType<
  typeof getUserPlaystreakQueryOptions
>
type getExternalEligibilityQueryOptionsType = ReturnType<
  typeof getExternalEligibilityQueryOptions
>

type Props = {
  quests?: Quest[] | null
  getQuest: (questId: number) => Promise<Quest>
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
  getExternalEligibility: (
    questId: number
  ) => Promise<ExternalEligibility | null>
  enabled?: boolean
  isSignedIn?: boolean
}

export function useGetQuestStates({
  quests,
  enabled = true,
  isSignedIn = false,
  getQuest,
  getUserPlayStreak,
  getExternalEligibility
}: Props) {
  const getQuestQueries: getQuestQueryOptionsType[] =
    quests?.map((quest) => ({
      ...getQuestQueryOptions(quest.id, getQuest),
      enabled
    })) ?? []

  const getQuestQuery = useQueries({
    queries: getQuestQueries
  })

  let getUserPlaystreakQueries: getUserPlaystreakQueryOptionsType[] = []
  if (isSignedIn) {
    getUserPlaystreakQueries =
      quests
        ?.filter((quest) => quest.type === 'PLAYSTREAK')
        .map((quest) => ({
          ...getUserPlaystreakQueryOptions(quest.id, getUserPlayStreak),
          enabled
        })) ?? []
  }

  let externalEligibilityQueries: getExternalEligibilityQueryOptionsType[] = []

  if (isSignedIn) {
    externalEligibilityQueries =
      quests
        ?.filter((quest) => quest.type === 'LEADERBOARD')
        .map((quest) => ({
          ...getExternalEligibilityQueryOptions({
            questId: quest.id,
            getExternalEligibility: getExternalEligibility,
            enabled
          })
        })) ?? []
  }

  const getUserPlaystreakQuery = useQueries({
    queries: getUserPlaystreakQueries
  })

  const getExternalEligibilityQuery = useQueries({
    queries: externalEligibilityQueries
  })

  const questMap: Record<number, Quest> = {}
  getQuestQuery
    .filter((val) => !!val.data)
    .forEach((val) => {
      if (!val.data) {
        return
      }
      questMap[val.data.id] = val.data
    })

  const questIdToQuestStateMap: Record<
    number,
    QuestLogInfo['state'] | undefined
  > = {}

  getUserPlaystreakQuery.forEach((val) => {
    if (!val.data || !Object.hasOwn(questMap, val.data.questId)) {
      return
    }
    const questId = val.data.questId
    const questData = questMap[questId]
    return (questIdToQuestStateMap[questId] = getPlaystreakQuestStatus(
      questData,
      val.data.userPlayStreak
    ))
  })

  getExternalEligibilityQuery.forEach((val) => {
    if (!val.data || !Object.hasOwn(questMap, val.data.questId)) {
      return
    }
    const questId = val.data.questId
    const questData = questMap[questId]
    questIdToQuestStateMap[questId] = getExternalQuestStatus(
      questData,
      val.data.externalEligibility
    )
  })

  const allQueries = [
    ...getQuestQuery,
    ...getUserPlaystreakQuery,
    ...getExternalEligibilityQuery
  ]

  return {
    isPending: allQueries.some((val) => val.status === 'pending'),
    isLoading: allQueries.some((val) => val.isLoading),
    isFetching: allQueries.some((val) => val.isFetching),
    questIdToQuestStateMap
  }
}
