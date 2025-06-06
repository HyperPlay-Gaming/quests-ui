import { QuestWrapperContextValue } from '@/types/quests'
import { Reward } from '@hyperplay/utils'
import { readContract } from '@wagmi/core'
import { erc20Abi, getAddress } from 'viem'
import { Config } from 'wagmi'

export async function checkIsFirstTimeHolder({
  rewardType,
  accountAddress,
  contractAddress,
  logError,
  rewardChainId,
  config
}: {
  rewardType: Reward['reward_type']
  accountAddress: `0x${string}` | undefined
  contractAddress: Reward['contract_address']
  logError: QuestWrapperContextValue['logError']
  rewardChainId: number | null
  config: Config
}) {
  let isFirstTimeHolder = false
  // this prevents the balance call with the 0x0 address
  if (accountAddress === undefined || rewardChainId === null) {
    return { isFirstTimeHolder: false }
  }

  // check balance before claim
  try {
    if (rewardType === 'ERC20' && accountAddress) {
      const erc20Balance = await readContract(config, {
        abi: erc20Abi,
        address: contractAddress,
        functionName: 'balanceOf',
        args: [getAddress(accountAddress)],
        chainId: rewardChainId
      })
      isFirstTimeHolder = erc20Balance === BigInt(0)
    }
  } catch (error) {
    logError(`Error checking if the user is holding erc20 ${error}`)
  }
  return { isFirstTimeHolder }
}
