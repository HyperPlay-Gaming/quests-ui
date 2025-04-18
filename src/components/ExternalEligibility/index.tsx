import { IconArrowUpRight } from '@tabler/icons-react'
import styles from './index.module.scss'
import { useTranslation } from 'react-i18next'
import { Button } from '@hyperplay/ui'
import { isValidHttpsUrl } from '@hyperplay/utils'
import cn from 'classnames'
export function ExternalEligibility({
  externalLink
}: {
  externalLink: string | null
}) {
  const { t } = useTranslation()

  if (!externalLink) {
    return (
      <div className={cn(styles.root, 'body')}>
        {t('quest.externalEligibility.leaderboard', 'Leaderboard')}
        <span className="color-neutral-400">
          {t('quest.externalEligibility.availableInGame', 'Available in-game')}
        </span>
      </div>
    )
  }

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
    <div className={cn(styles.root, 'body')}>
      {t('quest.externalEligibility.leaderboard', 'Leaderboard')}
      {isValidHttpsUrl(externalLink) ? link : null}
    </div>
  )
}
