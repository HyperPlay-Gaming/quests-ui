import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { getExternalQuestStatus } from './getExternalQuestStatus'
import { expect, it, describe } from 'vitest'

describe('getExternalQuestStatus', () => {
  const mockQuest = (status: Quest['status']): Quest => ({
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
    end_date: null,
    leaderboard_url: 'https://example.com'
  })

  const mockExternalEligibility = (amount: number): ExternalEligibility => ({
    amount,
    walletOrEmail: 'test@example.com'
  })

  it('returns READY_FOR_CLAIM when canClaimLeaderboardReward is true', () => {
    const quest = mockQuest('CLAIMABLE')
    const externalEligibility = mockExternalEligibility(100)
    const result = getExternalQuestStatus(quest, externalEligibility)
    expect(result).toBe('READY_FOR_CLAIM')
  })

  it('returns undefined when quest status is COMPLETED', () => {
    const quest = mockQuest('COMPLETED')
    const externalEligibility = mockExternalEligibility(0)
    const result = getExternalQuestStatus(quest, externalEligibility)
    expect(result).toBeUndefined()
  })

  it('returns ACTIVE when quest status is ACTIVE and cannot claim', () => {
    const quest = mockQuest('ACTIVE')
    const externalEligibility = mockExternalEligibility(0)
    const result = getExternalQuestStatus(quest, externalEligibility)
    expect(result).toBe('ACTIVE')
  })

  it('prioritizes READY_FOR_CLAIM over ACTIVE status', () => {
    const quest = mockQuest('CLAIMABLE')
    const externalEligibility = mockExternalEligibility(100)
    const result = getExternalQuestStatus(quest, externalEligibility)
    expect(result).toBe('READY_FOR_CLAIM')
  })
})
