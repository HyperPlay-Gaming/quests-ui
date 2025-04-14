import styles from './index.module.scss'
import cn from 'classnames'

interface RewardBannerProps {
  className?: string
  icon: React.ReactNode
  title: string
  disclaimer: string
}

export function RewardBanner({
  className,
  icon,
  title,
  disclaimer
}: RewardBannerProps) {
  return (
    <div className={cn(styles.root, className)}>
      {icon}
      <div className={styles.textContainer}>
        <span className="eyebrow">{title}</span>
        <span className="caption-sm">{disclaimer}</span>
      </div>
    </div>
  )
}
