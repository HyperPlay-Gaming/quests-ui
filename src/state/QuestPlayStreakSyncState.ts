import { Quest, Runner, UserPlayStreak } from '@hyperplay/utils'
import { makeAutoObservable } from 'mobx'
import { QueryClient } from '@tanstack/query-core'
import {
  getGetQuestQueryKey,
  getGetUserPlayStreakQueryKey,
  getSyncPlaysessionQueryKey
} from '@/helpers/getQueryKeys'
import { getQuestQueryOptions } from '@/hooks/useGetQuest'
import { getUserPlaystreakQueryOptions } from '@/hooks/useGetUserPlayStreak'

class QuestPlayStreakSyncState {
  // @ts-expect-error not assigned in constructor since this is a singleton
  getQuests: (projectId?: string | undefined) => Promise<Quest[]>
  // @ts-expect-error not assigned in constructor since this is a singleton
  getQuest: (questId: number) => Promise<Quest>
  // @ts-expect-error not assigned in constructor since this is a singleton
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
  // @ts-expect-error not assigned in constructor since this is a singleton
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>

  appQueryClient?: QueryClient

  projectSyncData: Record<
    string,
    {
      syncTimers: NodeJS.Timeout[]
      intervalTimers: NodeJS.Timeout[]
    }
  > = {}

  queryClient: QueryClient | undefined = undefined

  intervalSyncTick = 60000

  constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // Cache the data for 5 minutes
          retry: 1 // Retry failed request once
        }
      }
    })
    makeAutoObservable(this)
  }

  init({
    getQuests,
    getQuest,
    getUserPlayStreak,
    syncPlaySession,
    appQueryClient
  }: {
    getQuests: (projectId?: string | undefined) => Promise<Quest[]>
    getQuest: (questId: number) => Promise<Quest>
    getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
    syncPlaySession: (appName: string, runner: Runner) => Promise<void>
    appQueryClient?: QueryClient
  }) {
    this.getQuests = getQuests
    this.getQuest = getQuest
    this.getUserPlayStreak = getUserPlayStreak
    this.syncPlaySession = syncPlaySession
    this.appQueryClient = appQueryClient
  }

  async keepProjectQuestsInSync(projectId: string, runner: Runner) {
    const noClientErrMsg = 'must call init on QuestPlayStreakSyncState first'
    if (this.queryClient === undefined) {
      throw noClientErrMsg
    }

    const syncThisProjectMutation = async () => {
      if (this.queryClient === undefined) {
        throw noClientErrMsg
      }
      return this.queryClient!.fetchQuery({
        queryKey: getSyncPlaysessionQueryKey(projectId),
        /**
         * if multiple quests are syncing at the same time (within 1 second), we want to only send once.
         * if one quest finishes in 40 seconds and another in 41 seconds, then we want to post at 40 and 41 sec
         */
        staleTime: 500,
        queryFn: async () => {
          await this.syncPlaySession(projectId, runner)
          // all quest user playstreak data needs to be refetched after playsession sync
          const queryKey = ['getUserPlayStreak']
          this.appQueryClient?.invalidateQueries({ queryKey })
          return { dataUpdatedAtInMs: Date.now() }
        }
      })
    }

    // we don't know how much time elapsed between clicking play and the overlay/game being launched so sync first
    const { dataUpdatedAtInMs } = await syncThisProjectMutation()

    // set up the update every minute call
    const intervalId = setInterval(
      syncThisProjectMutation.bind(this),
      this.intervalSyncTick
    )
    if (!Object.hasOwn(this.projectSyncData, projectId)) {
      this.projectSyncData[projectId] = {
        syncTimers: [],
        intervalTimers: []
      }
    }
    this.projectSyncData[projectId].intervalTimers.push(intervalId)

    const quests = await this.getQuests(projectId)
    for (const quest of quests) {
      try {
        this.queryClient.invalidateQueries({
          queryKey: getGetQuestQueryKey(quest.id)
        })
        this.queryClient.invalidateQueries({
          queryKey: getGetUserPlayStreakQueryKey(quest.id)
        })
        // get quest
        const questMeta = await this.queryClient.fetchQuery(
          getQuestQueryOptions(quest.id, this.getQuest)
        )
        // get user playstreak
        const userPlayStreakData = await this.queryClient.fetchQuery(
          getUserPlaystreakQueryOptions(quest.id, this.getUserPlayStreak)
        )

        // set timeout for when we meet the min time
        const currentPlayTimeInSeconds =
          userPlayStreakData?.userPlayStreak
            .accumulated_playtime_today_in_seconds
        const minimumRequiredPlayTimeInSeconds =
          questMeta?.eligibility?.play_streak.minimum_session_time_in_seconds
        if (
          minimumRequiredPlayTimeInSeconds !== undefined &&
          minimumRequiredPlayTimeInSeconds !== null &&
          currentPlayTimeInSeconds !== undefined &&
          currentPlayTimeInSeconds !== null &&
          currentPlayTimeInSeconds < minimumRequiredPlayTimeInSeconds
        ) {
          const totalPlaysessionTimeLeftInSeconds =
            minimumRequiredPlayTimeInSeconds - currentPlayTimeInSeconds
          const timeElapsedSinceLastPlaysessionGetInSeconds = Math.min(
            (Date.now() - dataUpdatedAtInMs) / 1000
          )
          const durationLeftInSeconds =
            totalPlaysessionTimeLeftInSeconds -
            timeElapsedSinceLastPlaysessionGetInSeconds
          const finalSyncTimer = setTimeout(
            syncThisProjectMutation.bind(this),
            durationLeftInSeconds * 1000
          )
          this.projectSyncData[projectId].syncTimers.push(finalSyncTimer)
        }
      } catch (err) {
        console.error(`Error while setting up playstreak sync: ${err}`)
      }
    }
  }

  clearAllTimers() {
    for (const projectId of Object.keys(this.projectSyncData)) {
      for (const syncTimer of this.projectSyncData[projectId].syncTimers) {
        clearTimeout(syncTimer)
      }

      for (const intervalTimer of this.projectSyncData[projectId]
        .intervalTimers) {
        clearInterval(intervalTimer)
      }
    }
  }
}

export default new QuestPlayStreakSyncState()
