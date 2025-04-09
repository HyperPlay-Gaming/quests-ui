import { IconArrowUpRight } from '@tabler/icons-react'
import styles from './index.module.scss'
import classNames from 'classnames'

export function ExternalEligibility({
  externalLink
}: {
  externalLink: string
}) {
  return (
    <div className={styles.root}>
      Leaderboard
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames(styles.link, 'button-sm', 'weight--bold')}
      >
        View
        <IconArrowUpRight className={styles.icon} />
      </a>
    </div>
  )
}
