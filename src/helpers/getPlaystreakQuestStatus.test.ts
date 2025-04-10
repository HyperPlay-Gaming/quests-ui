import { expect, test, describe } from 'vitest'
import { Quest, UserPlayStreak } from '@hyperplay/utils'
import { getPlaystreakQuestStatus } from './getPlaystreakQuestStatus'

describe('get playstreak quest status test', () => {
  test('Get active status since quest is infinitely repeatable', () => {
    const quest: Quest = {
      id: 0,
      project_id: '0123',
      name: 'a quest',
      type: 'PLAYSTREAK',
      status: 'ACTIVE',
      description: 'description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: null,
      eligibility: {
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    }
    const playstreak: UserPlayStreak = {
      current_playstreak_in_days: 0,
      completed_counter: 1,
      accumulated_playtime_today_in_seconds: 100,
      last_play_session_completed_datetime: '0'
    }
    expect(getPlaystreakQuestStatus(quest, playstreak)).toEqual('ACTIVE')
  })

  test('Get ready for claim status', () => {
    const quest: Quest = {
      id: 0,
      project_id: '0123',
      name: 'a quest',
      type: 'PLAYSTREAK',
      status: 'ACTIVE',
      description: 'description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: null,
      eligibility: {
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    }
    const playstreak: UserPlayStreak = {
      current_playstreak_in_days: 100,
      completed_counter: 1,
      accumulated_playtime_today_in_seconds: 100,
      last_play_session_completed_datetime: '0'
    }
    expect(getPlaystreakQuestStatus(quest, playstreak)).toEqual(
      'READY_FOR_CLAIM'
    )
  })

  test('Get claimed status', () => {
    const quest: Quest = {
      id: 0,
      project_id: '0123',
      name: 'a quest',
      type: 'PLAYSTREAK',
      status: 'ACTIVE',
      description: 'description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    }
    const playstreak: UserPlayStreak = {
      current_playstreak_in_days: 100,
      completed_counter: 1,
      accumulated_playtime_today_in_seconds: 100,
      last_play_session_completed_datetime: '0'
    }
    expect(getPlaystreakQuestStatus(quest, playstreak)).toEqual('CLAIMED')
  })

  test('Get active status for finite completeable quest', () => {
    const quest: Quest = {
      id: 0,
      project_id: '0123',
      name: 'a quest',
      type: 'PLAYSTREAK',
      status: 'ACTIVE',
      description: 'description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    }
    const playstreak: UserPlayStreak = {
      current_playstreak_in_days: 1,
      completed_counter: 0,
      accumulated_playtime_today_in_seconds: 100,
      last_play_session_completed_datetime: '0'
    }
    expect(getPlaystreakQuestStatus(quest, playstreak)).toEqual('ACTIVE')
  })

  test('Quest status is undefined for COMPLETED status quest with min playstreak not met', () => {
    const quest: Quest = {
      id: 0,
      project_id: '0123',
      name: 'a quest',
      type: 'PLAYSTREAK',
      status: 'COMPLETED',
      description: 'description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    }
    const playstreak: UserPlayStreak = {
      current_playstreak_in_days: 1,
      completed_counter: 0,
      accumulated_playtime_today_in_seconds: 100,
      last_play_session_completed_datetime: '0'
    }
    expect(getPlaystreakQuestStatus(quest, playstreak)).toEqual(undefined)
  })

  test('Quest status is READY_FOR_CLAIM for COMPLETED status quest with min playstreak met', () => {
    const quest: Quest = {
      id: 0,
      project_id: '0123',
      name: 'a quest',
      type: 'PLAYSTREAK',
      status: 'COMPLETED',
      description: 'description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        steam_games: [],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    }
    const playstreak: UserPlayStreak = {
      current_playstreak_in_days: 10,
      completed_counter: 0,
      accumulated_playtime_today_in_seconds: 100,
      last_play_session_completed_datetime: '0'
    }
    expect(getPlaystreakQuestStatus(quest, playstreak)).toEqual(
      'READY_FOR_CLAIM'
    )
  })
})

export {}
