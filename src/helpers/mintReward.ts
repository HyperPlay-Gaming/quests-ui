import { DepositContract, Reward, RewardClaimSignature } from '@hyperplay/utils'
import { questRewardAbi } from '../abis/RewardsAbi'
import { Config } from 'wagmi'
import { simulateContract, writeContract } from '@wagmi/core'

export async function mintReward({
  reward,
  questId,
  signature,
  getDepositContracts,
  config
}: {
  reward: Reward
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

  console.log('depositContracts', depositContracts)

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
    const params = [
      BigInt(1),
      '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      BigInt('100000000000000000000'),
      BigInt('0x51dbc174f0465665658a7d7e9aeaef5e'),
      BigInt(1747340359),
      '0x19e4dd106d8547ae8bd89fd0b1426d17aa30bc9598bbee0d5df5843a9f5281c92b1070884a801bdc97a12ce87ce664cdc016ad9dd0602d9b045841735dad83bc1b'
    ] as const
    const { request } = await simulateContract(config, {
      address: depositContractAddress,
      abi: questRewardAbi,
      functionName: 'withdrawERC20',
      args: params
    })
    console.log('request', request)
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
