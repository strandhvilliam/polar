'use client'

import { EventRow } from '@/components/Events/EventRow'
import { schemas } from '@polar-sh/client'

export const TimelineEvent = ({
  event,
  organization,
}: {
  event: schemas['Event']
  organization: schemas['Organization']
}) => {
  return (
    <div className="relative flex gap-x-3">
      <div className="relative z-10 w-6 shrink-0" aria-hidden />
      <div className="group min-w-0 flex-1 pb-3">
        <EventRow
          event={event}
          organization={organization}
          renderChildren={false}
        />
      </div>
    </div>
  )
}
