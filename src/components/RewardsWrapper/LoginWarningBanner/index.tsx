import { IconAlertTriangle } from '@tabler/icons-react'
import styles from './LoginWarningBanner.module.scss'
import { useTranslation } from 'react-i18next'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'

export function LoginWarningBanner() {
  const { tOverride } = useQuestWrapper()
  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  return (
    <div className={styles.root}>
      <IconAlertTriangle className={styles.icon} />
      <span className="eyebrow">
        {t(
          'quest.rewards.loginWarningBanner',
          'Log into HyperPlay to track quest eligibility'
        )}
      </span>
    </div>
  )
}
