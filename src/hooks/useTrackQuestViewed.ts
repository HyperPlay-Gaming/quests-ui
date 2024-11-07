import { QuestWrapperContextValue } from '@/types/quests'
import { useEffect } from 'react'

export function useTrackQuestViewed(
  selectedQuestId: number | null,
  trackEvent: QuestWrapperContextValue['trackEvent']
) {
  useEffect(() => {
    if (selectedQuestId !== null) {
      trackEvent({
        event: 'Quest Viewed',
        properties: { quest: { id: selectedQuestId.toString() } }
      })
    }
  }, [selectedQuestId])
}
