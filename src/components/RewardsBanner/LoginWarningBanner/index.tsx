import { IconAlertTriangle } from '@tabler/icons-react'
import styles from './LoginWarningBanner.module.scss'
import { useTranslation } from 'react-i18next'
import { useQuestWrapper } from '@/state/QuestWrapperProvider'
import cn from 'classnames'

export function LoginWarningBanner({ className }: { className?: string }) {
  const { tOverride } = useQuestWrapper()
  const { t: tOriginal } = useTranslation()
  const t = tOverride || tOriginal

  return (
    <div className={cn(styles.root, className)}>
      <IconAlertTriangle className={styles.icon} />
      <span className="eyebrow weight--bold">
        {t(
          'quest.rewards.loginWarningBanner',
          'Log into HyperPlay to track quest eligibility'
        )}
      </span>
    </div>
  )
}
