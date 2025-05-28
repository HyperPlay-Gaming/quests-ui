import { QuestWrapperContextValue } from '@/types/quests'
import { Reward } from '@hyperplay/utils'
import { readContract } from '@wagmi/core'
import { useEffect, useState } from 'react'
import { erc20Abi } from 'viem'
import { useAccount, useConfig } from 'wagmi'

export interface IsFirstTimeHolderInterface {
  rewardType: Reward['reward_type']
  contractAddress: Reward['contract_address']
  logError: QuestWrapperContextValue['logError']
}

export function useIsFirstTimeHolder({
  rewardType,
  contractAddress,
  logError
}: IsFirstTimeHolderInterface) {
  const account = useAccount()
  const config = useConfig()

  const [isFirstTimeHolder, setIsFirstTimeHolder] = useState(false)
  useEffect(() => {
    async function checkIfUserIsAlreadyHoldingERC20() {
      if (rewardType !== 'ERC20' || account === undefined) {
        return
      }
      const erc20Balance = await readContract(config, {
        abi: erc20Abi,
        address: contractAddress,
        functionName: 'balanceOf',
        args: [account.address ?? '0x0000000000000000000000000000000000000000']
      })

      if (erc20Balance === BigInt(0)) {
        setIsFirstTimeHolder(true)
      } else {
        setIsFirstTimeHolder(false)
      }
    }
    try {
      checkIfUserIsAlreadyHoldingERC20()
    } catch (err) {
      logError(`Error checking if the user is holding erc20 ${err}`)
    }
  }, [account, rewardType, contractAddress])

  return { isFirstTimeHolder }
}
