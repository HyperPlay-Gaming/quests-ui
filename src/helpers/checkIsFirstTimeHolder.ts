import { QuestWrapperContextValue } from '@/types/quests'
import { Reward } from '@hyperplay/utils'
import { readContract } from '@wagmi/core'
import { erc20Abi } from 'viem'
import { Config } from 'wagmi'

export async function checkIsFirstTimeHolder({
  rewardType,
  accountAddress,
  contractAddress,
  logError,
  config
}: {
  rewardType: Reward['reward_type']
  accountAddress: `0x${string}`
  contractAddress: Reward['contract_address']
  logError: QuestWrapperContextValue['logError']
  config: Config
}) {
  let isFirstTimeHolder = false

  // check balance before claim
  try {
    if (rewardType === 'ERC20' && accountAddress) {
      const erc20Balance = await readContract(config, {
        abi: erc20Abi,
        address: contractAddress,
        functionName: 'balanceOf',
        args: [accountAddress]
      })
      isFirstTimeHolder = erc20Balance === BigInt(0)
    }
  } catch (error) {
    logError(`Error checking if the user is holding erc20 ${error}`)
  }
  return { isFirstTimeHolder }
}
