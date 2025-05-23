import { DepositContract, RewardClaimSignature } from '@hyperplay/utils'
import { questRewardAbi } from '../abis/RewardsAbi'
import { Config } from 'wagmi'
import { simulateContract, writeContract } from '@wagmi/core'
import { UseGetRewardsData } from '@/types/quests'

export async function mintReward({
  reward,
  questId,
  signature,
  getDepositContracts,
  config
}: {
  reward: UseGetRewardsData
  questId: number
  signature: RewardClaimSignature
  getDepositContracts: (questId: number) => Promise<DepositContract[]>
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
    return writeContract(config, request)
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
    return writeContract(config, request)
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
    return writeContract(config, request)
  }

  throw Error('Unsupported reward type')
}
