export type TrackEventFn = ({
  event,
  properties
}: {
  event: string
  properties?: Record<string, any>
}) => void