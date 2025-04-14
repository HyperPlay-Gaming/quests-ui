import { IconArrowUpRight } from '@tabler/icons-react'
import styles from './index.module.scss'
import { useTranslation } from 'react-i18next'
import { Button } from '@hyperplay/ui'
import { isValidHttpsUrl } from '@hyperplay/utils'

export function ExternalEligibility({
  externalLink
}: {
  externalLink: string
}) {
  const { t } = useTranslation()
  const link = (
    <a href={externalLink} target="_blank" rel="noopener noreferrer">
      <Button type="secondary" size="small">
        <span className={styles.link}>
          {t('quest.externalEligibility.view', 'View')}
          <IconArrowUpRight className={styles.icon} />
        </span>
      </Button>
    </a>
  )
  return (
    <div className={styles.root}>
      {t('quest.externalEligibility.leaderboard', 'Leaderboard')}
      {isValidHttpsUrl(externalLink) ? link : null}
    </div>
  )
}
