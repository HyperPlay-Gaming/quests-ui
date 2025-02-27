import {
  DepositContract,
  LogOptions,
  Reward,
  RewardClaimSignature
} from '@hyperplay/utils'
import { questRewardAbi } from '../abis/RewardsAbi'
import { WriteContractMutateAsync } from 'wagmi/query'
import { Config } from 'wagmi'
import { simulateContract } from '@wagmi/core'
import { WarningError } from '@/types/quests'
import { ContractFunctionRevertedError, BaseError } from 'viem'

export function getClaimErrorMessages(error: Error) {
  let errorMessage = 'Error during reward claim'
  let errorSeverity: 'Error' | 'Warning' = 'Error'

  /**
   * @dev this block gets a useful error message in the mutate onError handler for tracking and logging purposes
   */
  if (error instanceof BaseError) {
    errorSeverity = 'Warning'
    // @dev this is the suggested approach for simulateContract errors https://viem.sh/docs/contract/simulateContract#handling-custom-errors
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError
    )
    if (revertError instanceof ContractFunctionRevertedError) {
      errorMessage = revertError.reason ?? 'Unknown BaseError revert reason'
    } else if (revertError) {
      errorMessage = `BaseError: ${revertError.name} ${revertError.message}`
    } else {
      errorMessage = `Unknown BaseError`
    }
  } else if (error instanceof WarningError) {
    errorSeverity = 'Warning'
    errorMessage = error.title
  } else if (error instanceof Error) {
    errorMessage = JSON.stringify(error.message, null, 2)
  } else {
    errorMessage = JSON.stringify(error, null, 2)
  }

  return { errorMessage, errorSeverity }
}

export async function mintReward({
  reward,
  questId,
  signature,
  writeContractAsync,
  getDepositContracts,
  connectorName,
  logError,
  config
}: {
  reward: Reward
  questId: number
  signature: RewardClaimSignature
  writeContractAsync: WriteContractMutateAsync<Config, unknown>
  getDepositContracts: (questId: number) => Promise<DepositContract[]>
  logError: (message: string, options?: LogOptions) => void
  connectorName?: string
  config: Config
}) {
  if (reward.chain_id === null) {
    throw Error('chain id is not set for reward when trying to mint')
  }

  const isERC1155Reward =
    reward.reward_type === 'ERC1155' && reward.token_ids.length === 1

  const depositContracts: DepositContract[] = await getDepositContracts(questId)

  const depositContractAddress = depositContracts.find(
    (val) => val.chain_id === reward.chain_id
  )?.contract_address

  if (depositContractAddress === undefined) {
    throw Error(
      `Deposit contract address undefined for quest ${questId} and chain id ${reward.chain_id}`
    )
  }

  const logMintingError = (error: Error) => {
    const { errorMessage } = getClaimErrorMessages(error)
    logError(`Error claiming reward: ${error.message}`, {
      sentryException: error,
      sentryExtra: {
        questId: questId,
        reward: reward,
        error: errorMessage,
        connector: connectorName
      },
      sentryTags: {
        action: 'claim_on_chain_reward',
        feature: 'quests'
      }
    })
  }

  /**
   * @dev simulateContract will throw if the contract write will fail.
   * This is the recommended usage from https://viem.sh/docs/contract/writeContract#usage
   */
  if (
    reward.reward_type === 'ERC20' &&
    reward.amount_per_user &&
    reward.decimals
  ) {
    const { request } = await simulateContract(config, {
      address: depositContractAddress,
      abi: questRewardAbi,
      functionName: 'withdrawERC20',
      args: [
        BigInt(questId),
        reward.contract_address,
        BigInt(reward.amount_per_user),
        BigInt(signature.nonce),
        BigInt(signature.expiration),
        signature.signature
      ]
    })
    return writeContractAsync(request, {
      onError: logMintingError
    })
  } else if (isERC1155Reward && reward.decimals !== null) {
    const { token_id, amount_per_user } = reward.token_ids[0]
    const { request } = await simulateContract(config, {
      address: depositContractAddress,
      abi: questRewardAbi,
      functionName: 'withdrawERC1155',
      args: [
        BigInt(questId),
        reward.contract_address,
        BigInt(token_id),
        BigInt(amount_per_user),
        BigInt(signature.nonce),
        BigInt(signature.expiration),
        signature.signature
      ]
    })
    return writeContractAsync(request, {
      onError: logMintingError
    })
  } else if (reward.reward_type === 'ERC721' && reward.amount_per_user) {
    const { request } = await simulateContract(config, {
      address: depositContractAddress,
      abi: questRewardAbi,
      functionName: 'withdrawERC721',
      args: [
        BigInt(questId),
        reward.contract_address,
        BigInt(signature.tokenIds[0]),
        BigInt(signature.nonce),
        BigInt(signature.expiration),
        signature.signature
      ]
    })
    return writeContractAsync(request, {
      onError: logMintingError
    })
  }

  throw Error('Unsupported reward type')
}
