import { TrackEventFn } from '@/types/analytics'
import { useEffect } from 'react'

export function useTrackQuestViewed(
  selectedQuestId: number | null,
  trackEvent: TrackEventFn
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
