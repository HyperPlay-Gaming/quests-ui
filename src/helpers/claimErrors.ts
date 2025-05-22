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
