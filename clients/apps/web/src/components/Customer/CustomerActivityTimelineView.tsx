'use client'

import { EmptyState } from '@/components/CustomerPortal/EmptyState'
import { TimelineSpine } from '@/components/Customer/Timeline/TimelineSpine'
import { useTimelineItems } from '@/components/Customer/Timeline/useTimelineItems'
import { useInfiniteEvents } from '@/hooks/queries/events'
import { useInViewport } from '@/hooks/utils'
import { History } from 'lucide-react'
import { schemas } from '@polar-sh/client'
import FormattedDateTime from '@polar-sh/ui/components/atoms/FormattedDateTime'
import { TabsContent } from '@polar-sh/ui/components/atoms/Tabs'
import { useEffect, useMemo } from 'react'
import Spinner from '../Shared/Spinner'
import { StatisticCard } from '../Shared/StatisticCard'

export const CustomerActivityTimelineView = ({
  customer,
  organization,
  dateRange,
}: {
  customer: schemas['Customer']
  organization: schemas['Organization']
  dateRange: { startDate: Date; endDate: Date }
}) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteEvents(customer.organization_id, {
      limit: 50,
      customer_id: customer.id,
      source: 'system',
      sorting: ['timestamp'],
      ...(dateRange?.startDate
        ? { start_timestamp: dateRange.startDate.toISOString() }
        : {}),
      ...(dateRange?.endDate
        ? { end_timestamp: dateRange.endDate.toISOString() }
        : {}),
    })

  const flatEvents = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )

  const eventTotalCount = useMemo(() => {
    const pagination = data?.pages[0]?.pagination
    if (pagination && 'total_count' in pagination) {
      return pagination.total_count
    }
    return 0
  }, [data])

  const timelineItems = useTimelineItems(flatEvents)

  const { ref: sentinelRef, inViewport } = useInViewport<HTMLDivElement>()

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <TabsContent value="activity" className="flex flex-col gap-y-8">
        <div className="flex flex-row gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="dark:bg-polar-800 h-16 flex-1 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
        <div className="relative">
          <div
            className="dark:bg-polar-700 absolute top-2 bottom-2 left-[11px] w-0.5 bg-gray-200"
            aria-hidden
          />
          <div className="relative flex flex-col gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-x-3">
                <div className="w-6 shrink-0" aria-hidden />
                <div className="dark:bg-polar-800 h-11 min-w-0 flex-1 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="activity" className="flex flex-col gap-y-8">
      <div className="flex flex-row gap-3">
        <StatisticCard title="Activities">{eventTotalCount}</StatisticCard>
        <StatisticCard title="Customer since">
          <FormattedDateTime datetime={customer.created_at} />
        </StatisticCard>
      </div>
      {flatEvents.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="No activity yet"
          description="There are no events for this customer in the selected date range"
        />
      ) : (
        <>
          <TimelineSpine
            items={timelineItems}
            organization={organization}
            endDate={dateRange.endDate}
          />
          {hasNextPage ? (
            <div
              ref={sentinelRef}
              className="flex min-h-12 w-full items-center justify-center py-4"
            >
              {isFetchingNextPage ? <Spinner /> : null}
            </div>
          ) : null}
        </>
      )}
    </TabsContent>
  )
}
