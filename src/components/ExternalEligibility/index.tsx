import { IconArrowUpRight } from '@tabler/icons-react'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

export function ExternalEligibility({
  externalLink
}: {
  externalLink: string
}) {
  const { t } = useTranslation()
  return (
    <div className={styles.root}>
      {t('quest.externalEligibility.leaderboard', 'Leaderboard')}
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames(styles.link, 'button-sm', 'weight--bold')}
      >
        {t('quest.externalEligibility.view', 'View')}
        <IconArrowUpRight className={styles.icon} />
      </a>
    </div>
  )
}
