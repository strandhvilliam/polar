'use client'

import { schemas } from '@polar-sh/client'
import { format } from 'date-fns'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { TimelineDateHeader } from './TimelineDateHeader'
import { TimelineEvent } from './TimelineEvent'
import { TimelineMilestone } from './TimelineMilestone'
import { TimelineSpineMarkerRow } from './TimelineSpineMarkerRow'
import type { TimelineItem } from './useTimelineItems'

const renderItem = (
  item: TimelineItem,
  index: number,
  organization: schemas['Organization'],
) => {
  switch (item.type) {
    case 'date-header':
      return (
        <TimelineDateHeader
          key={`h-${item.date}-${index}`}
          date={item.date}
          cumulativeBilled={item.cumulativeBilled}
        />
      )
    case 'milestone':
      return (
        <TimelineMilestone
          key={`m-${item.eventId}-${item.index}`}
          milestone={item.milestone}
        />
      )
    case 'event':
      return (
        <TimelineEvent
          key={item.event.id}
          event={item.event}
          organization={organization}
        />
      )
  }
}

export const TimelineSpine = ({
  items,
  organization,
  endDate,
  className,
}: {
  items: TimelineItem[]
  organization: schemas['Organization']
  endDate: Date
  className?: string
}) => {
  const [asOf] = useState(() => Date.now())
  const isLive = endDate.getTime() >= asOf
  return (
    <div className={twMerge('relative', className)}>
      <div
        className="dark:bg-polar-700 absolute top-4 bottom-4 left-[11px] w-0.5 bg-gray-200"
        aria-hidden
      />
      <div className="relative flex flex-col">
        {items.map((item, index) => renderItem(item, index, organization))}
        <TimelineSpineMarkerRow contentClassName="ml-1.5 items-center gap-x-2">
          <span className="dark:text-polar-500 shrink-0 font-mono text-xs font-medium text-gray-500">
            {isLive ? 'Now' : 'End of period'}
          </span>
          {!isLive ? (
            <span className="dark:text-polar-500 shrink-0 font-mono text-xs text-gray-400">
              {format(endDate, 'MMM d, yyyy')}
            </span>
          ) : null}
        </TimelineSpineMarkerRow>
      </div>
    </div>
  )
}
