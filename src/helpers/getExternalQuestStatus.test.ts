import { ExternalEligibility, Quest } from '@hyperplay/utils'
import { getExternalQuestStatus } from './getExternalQuestStatus'
import { expect, it, describe } from 'vitest'

describe('getExternalQuestStatus', () => {
  const mockQuest = (status: Quest['status'], endDate?: string): Quest => ({
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
    end_date: endDate || null,
    leaderboard_url: 'https://example.com'
  })

  const mockExternalEligibility = (amount: number): ExternalEligibility => ({
    amount,
    walletOrEmail: 'test@example.com'
  })

  it('returns ACTIVE when quest status is ACTIVE', () => {
    const quest = mockQuest('ACTIVE')
    const result = getExternalQuestStatus(quest, null)
    expect(result).toBe('ACTIVE')
  })

  it('returns ACTIVE when quest is CLAIMABLE but has not ended', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    const quest = mockQuest('CLAIMABLE', futureDate)
    const result = getExternalQuestStatus(quest, null)
    expect(result).toBe('ACTIVE')
  })

  it('returns undefined when quest is CLAIMABLE, has ended, but has no external eligibility', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    const quest = mockQuest('CLAIMABLE', pastDate)
    const result = getExternalQuestStatus(quest, null)
    expect(result).toBeUndefined()
  })

  it('returns undefined when quest is CLAIMABLE, has ended, and cannot claim reward', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    const quest = mockQuest('CLAIMABLE', pastDate)
    const externalEligibility = mockExternalEligibility(0)
    const result = getExternalQuestStatus(quest, externalEligibility)
    expect(result).toBeUndefined()
  })

  it('returns READY_FOR_CLAIM when quest is CLAIMABLE, has ended, and can claim reward', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    const quest = mockQuest('CLAIMABLE', pastDate)
    const externalEligibility = mockExternalEligibility(100)
    const result = getExternalQuestStatus(quest, externalEligibility)
    expect(result).toBe('READY_FOR_CLAIM')
  })

  it('returns undefined when quest status is COMPLETED', () => {
    const quest = mockQuest('COMPLETED')
    const result = getExternalQuestStatus(quest, null)
    expect(result).toBeUndefined()
  })
})
