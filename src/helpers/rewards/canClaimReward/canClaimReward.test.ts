import { canClaimReward } from './canClaimReward'
import { describe, it, expect } from 'vitest'
import { Quest, ExternalEligibility, UserPlayStreak } from '@hyperplay/utils'

describe('canClaimReward', () => {
  describe('LEADERBOARD quests', () => {
    const createLeaderboardQuest = (status: 'CLAIMABLE' | 'ACTIVE'): Quest => ({
      id: 1,
      project_id: '0123',
      name: 'Test Quest',
      type: 'LEADERBOARD',
      status,
      description: 'Test Description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        completion_threshold: 10,
        steam_games: [{ id: '123' }],
        play_streak: {
          required_playstreak_in_days: 1,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    })

    const createExternalEligibility = (
      amount: number
    ): ExternalEligibility => ({
      amount,
      walletOrEmail: 'test@example.com'
    })

    const createQuestPlayStreakData = (): UserPlayStreak => ({
      current_playstreak_in_days: 0,
      completed_counter: 0,
      accumulated_playtime_today_in_seconds: 0,
      last_play_session_completed_datetime: ''
    })

    it('should return true for claimable quest with positive eligibility', () => {
      const quest = createLeaderboardQuest('CLAIMABLE')
      const externalEligibility = createExternalEligibility(100)
      const playstreakData = createQuestPlayStreakData()

      expect(
        canClaimReward({ quest, externalEligibility, playstreakData })
      ).toBe(true)
    })

    it('should return false for claimable quest with zero eligibility', () => {
      const quest = createLeaderboardQuest('CLAIMABLE')
      const externalEligibility = createExternalEligibility(0)
      const playstreakData = createQuestPlayStreakData()

      expect(
        canClaimReward({ quest, externalEligibility, playstreakData })
      ).toBe(false)
    })

    it('should return false for incomplete quest', () => {
      const quest = createLeaderboardQuest('ACTIVE')
      const externalEligibility = createExternalEligibility(100)
      const playstreakData = createQuestPlayStreakData()

      expect(
        canClaimReward({ quest, externalEligibility, playstreakData })
      ).toBe(false)
    })
  })

  describe('PLAYSTREAK quests', () => {
    const createPlaystreakQuest = (status: 'COMPLETED' | 'ACTIVE'): Quest => ({
      id: 1,
      project_id: '0123',
      name: 'Test Quest',
      type: 'PLAYSTREAK',
      status,
      description: 'Test Description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        completion_threshold: 10,
        steam_games: [{ id: '123' }],
        play_streak: {
          required_playstreak_in_days: 10,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    })

    const createExternalEligibility = (): ExternalEligibility => ({
      amount: 0,
      walletOrEmail: 'test@example.com'
    })

    it('should return true when playstreak status is READY_FOR_CLAIM', () => {
      const quest = createPlaystreakQuest('ACTIVE')
      const externalEligibility = createExternalEligibility()
      const playstreakData: UserPlayStreak = {
        current_playstreak_in_days: 10,
        completed_counter: 0,
        accumulated_playtime_today_in_seconds: 100,
        last_play_session_completed_datetime: ''
      }

      expect(
        canClaimReward({ quest, externalEligibility, playstreakData })
      ).toBe(true)
    })

    it('should return false when playstreak status is not READY_FOR_CLAIM', () => {
      const quest = createPlaystreakQuest('ACTIVE')
      const externalEligibility = createExternalEligibility()
      const playstreakData: UserPlayStreak = {
        current_playstreak_in_days: 5,
        completed_counter: 0,
        accumulated_playtime_today_in_seconds: 100,
        last_play_session_completed_datetime: ''
      }

      expect(
        canClaimReward({ quest, externalEligibility, playstreakData })
      ).toBe(false)
    })
  })

  it('should throw error for invalid quest type', () => {
    const quest = {
      id: 1,
      project_id: '0123',
      name: 'Test Quest',
      type: 'INVALID' as any,
      status: 'CLAIMABLE' as const,
      description: 'Test Description',
      deposit_contracts: [],
      quest_external_game: null,
      num_of_times_repeatable: 1,
      eligibility: {
        completion_threshold: 10,
        steam_games: [{ id: '123' }],
        play_streak: {
          required_playstreak_in_days: 1,
          minimum_session_time_in_seconds: 100
        }
      },
      start_date: null,
      end_date: null
    } as Quest

    const externalEligibility: ExternalEligibility = {
      amount: 0,
      walletOrEmail: 'test@example.com'
    }

    const playstreakData: UserPlayStreak = {
      current_playstreak_in_days: 0,
      completed_counter: 0,
      accumulated_playtime_today_in_seconds: 0,
      last_play_session_completed_datetime: ''
    }

    expect(() =>
      canClaimReward({ quest, externalEligibility, playstreakData })
    ).toThrow('Invalid quest type')
  })
})
