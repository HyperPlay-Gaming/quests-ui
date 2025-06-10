import { ExistingSignatureError, NoAccountConnectedError } from '@/types/quests'
import { SwitchChainError, UserRejectedRequestError } from 'viem'

export function errorIsSwitchChainError(
  error: Error
): error is SwitchChainError {
  return error?.name === 'SwitchChainError'
}

export function errorIsUserRejected(
  error: Error
): error is UserRejectedRequestError {
  return error instanceof UserRejectedRequestError
}

export function errorIsNoAccountConnectedError(
  error: Error
): error is NoAccountConnectedError {
  return error instanceof NoAccountConnectedError
}

export function isExistingSignatureError(
  error: Error
): error is ExistingSignatureError {
  return error instanceof ExistingSignatureError
}
