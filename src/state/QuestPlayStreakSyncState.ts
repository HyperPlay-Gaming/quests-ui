import { Quest, Runner, UserPlayStreak } from '@hyperplay/utils'
import { makeAutoObservable } from 'mobx'
import { QueryClient } from '@tanstack/query-core'
import { resetSessionStartedTime } from '@/helpers/getPlaystreakArgsFromQuestData'

class QuestPlayStreakSyncState {
  // @ts-expect-error not assigned in constructor since this is a singleton
  getQuests: (projectId?: string | undefined) => Promise<Quest[]>
  // @ts-expect-error not assigned in constructor since this is a singleton
  getQuest: (questId: number) => Promise<Quest>
  // @ts-expect-error not assigned in constructor since this is a singleton
  getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
  // @ts-expect-error not assigned in constructor since this is a singleton
  syncPlaySession: (appName: string, runner: Runner) => Promise<void>

  projectSyncData: Record<
    string,
    {
      syncTimers: NodeJS.Timeout[]
      intervalTimers: NodeJS.Timer[]
    }
  > = {}

  queryClient: QueryClient | undefined = undefined

  intervalSyncTick = 60000

  constructor() {
    makeAutoObservable(this)
  }

  init({
    getQuests,
    getQuest,
    getUserPlayStreak,
    syncPlaySession,
    queryClient
  }: {
    getQuests: (projectId?: string | undefined) => Promise<Quest[]>
    getQuest: (questId: number) => Promise<Quest>
    getUserPlayStreak: (questId: number) => Promise<UserPlayStreak>
    syncPlaySession: (appName: string, runner: Runner) => Promise<void>
    queryClient: QueryClient
  }) {
    this.getQuests = getQuests
    this.getQuest = getQuest
    this.getUserPlayStreak = getUserPlayStreak
    this.syncPlaySession = syncPlaySession
    this.queryClient = queryClient
  }

  async keepProjectQuestsInSync(projectId: string) {
    if (this.queryClient === undefined) {
      throw 'must call init on QuestPlayStreakSyncState first'
    }
    const quests = await this.getQuests(projectId)
    for (const quest of quests) {
      try {
        // get quest
        const getQuestQueryKey = `getQuest:${quest.id}`
        const questMeta = await this.queryClient.fetchQuery({
          queryKey: [getQuestQueryKey],
          queryFn: async () => this.getQuest(quest.id)
        })
        // get user playstreak
        const getUserPlayStreakQueryKey = ['getUserPlayStreak', quest.id]
        const userPlayStreakData = await this.queryClient.fetchQuery({
          queryKey: [getUserPlayStreakQueryKey],
          queryFn: async () => this.getUserPlayStreak(quest.id)
        })

        if (!Object.hasOwn(this.projectSyncData, projectId)) {
          this.projectSyncData[projectId] = {
            syncTimers: [],
            intervalTimers: []
          }
        }

        const syncThisProjectMutation = async () =>
          this.queryClient?.fetchQuery({
            queryKey: ['syncPlaysession', projectId],
            queryFn: async () => {
              this.syncPlaySession(
                projectId,
                questMeta.quest_external_game?.runner ?? 'hyperplay'
              )
              resetSessionStartedTime()
              // all quest user playstreak data needs to be refetched after playsession sync
              for (const questToInvalidate of quests) {
                const queryKey = ['getUserPlayStreak', questToInvalidate.id]
                this.queryClient?.invalidateQueries({ queryKey })
              }
            }
          })

        // set timeout for when we meet the min time
        const currentPlayTimeInSeconds =
          userPlayStreakData.accumulated_playtime_today_in_seconds
        const minimumRequiredPlayTimeInSeconds =
          questMeta?.eligibility?.play_streak.minimum_session_time_in_seconds
        if (
          minimumRequiredPlayTimeInSeconds &&
          currentPlayTimeInSeconds &&
          currentPlayTimeInSeconds < minimumRequiredPlayTimeInSeconds
        ) {
          console.log('setting timeout for post mutation')
          const finalSyncTimer = setTimeout(
            syncThisProjectMutation,
            minimumRequiredPlayTimeInSeconds - currentPlayTimeInSeconds
          )
          this.projectSyncData[projectId].syncTimers.push(finalSyncTimer)
        }

        const intervalId = setInterval(
          syncThisProjectMutation,
          this.intervalSyncTick
        )
        this.projectSyncData[projectId].syncTimers.push(intervalId)
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
