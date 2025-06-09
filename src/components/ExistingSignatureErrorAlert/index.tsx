import { AlertCard, Images } from '@hyperplay/ui'
import { getAddress } from 'viem'
import { useTranslation } from 'react-i18next'
import { truncateEthAddress } from '../truncateAddress'

export function ExistingSignatureErrorAlert({
  existingSignatureAddress
}: {
  existingSignatureAddress: string
}) {
  const { t } = useTranslation()
  return (
    <AlertCard
      icon={<Images.AlertOctagon />}
      showClose={false}
      title={t(
        'quest.existingSignatureErrorTitle',
        'Wrong Wallet. Switch to {{address}}',
        { address: truncateEthAddress(getAddress(existingSignatureAddress)) }
      )}
      message={t(
        'quest.existingSignatureErrorMessage',
        'Looks like you started your claim with a different wallet. Try switching back to that one to finish claiming your reward.'
      )}
      variant="error"
      noBorderLeft={true}
    />
  )
}
