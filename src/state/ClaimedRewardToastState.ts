import { Reward } from '@hyperplay/utils'
import { makeAutoObservable } from 'mobx'

const CLEAR_TIMEOUT_MS = 5000

class ClaimedRewardToastState {
  private reward: Reward | null = null
  private clearTimeoutId: NodeJS.Timeout | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  private startClearTimeout() {
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId)
    }

    this.clearTimeoutId = setTimeout(() => {
      this.reward = null
      this.clearTimeoutId = undefined
    }, CLEAR_TIMEOUT_MS)
  }

  showClaimedReward(reward: Reward) {
    this.reward = reward
    this.startClearTimeout()
  }

  get claimedReward() {
    return this.reward
  }

  clearReward() {
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId)
    }
    this.reward = null
    this.clearTimeoutId = undefined
  }
}

export const claimedRewardToastState = new ClaimedRewardToastState()
