import { UTCDate } from '@date-fns/utc'
import { schemas } from '@polar-sh/client'
import { formatCurrency } from '@polar-sh/currency'
import { format } from 'date-fns'
import { useMemo } from 'react'

export type MilestoneVariant = 'positive' | 'negative' | 'neutral'

export type Milestone = {
  label: string
  timestamp: string
  variant: MilestoneVariant
}

export type TimelineItem =
  | {
      type: 'date-header'
      date: string
      cumulativeBilled: { total: number } | undefined
    }
  | { type: 'milestone'; eventId: string; index: number; milestone: Milestone }
  | { type: 'event'; event: schemas['Event'] }

const calendarDateKey = (iso: string) => format(new UTCDate(iso), 'yyyy-MM-dd')

const LIFECYCLE_MILESTONES: Record<
  string,
  { label: string; variant: MilestoneVariant }
> = {
  'customer.created': { label: 'Customer joined', variant: 'neutral' },
  'subscription.created': {
    label: 'Subscription started',
    variant: 'positive',
  },
  'subscription.canceled': {
    label: 'Subscription canceled',
    variant: 'negative',
  },
  'subscription.uncanceled': {
    label: 'Subscription reactivated',
    variant: 'positive',
  },
  'subscription.product_updated': {
    label: 'Plan changed',
    variant: 'neutral',
  },
  'order.refunded': { label: 'Refund issued', variant: 'negative' },
  'balance.dispute': { label: 'Dispute opened', variant: 'negative' },
}

const REVENUE_MILESTONE_THRESHOLDS = [
  10_000, 50_000, 100_000, 500_000, 1_000_000, 5_000_000, 10_000_000,
] as const

const isOrderEvent = (
  event: schemas['Event'],
): event is schemas['OrderPaidEvent'] | schemas['OrderRefundedEvent'] =>
  event.source === 'system' &&
  (event.name === 'order.paid' || event.name === 'order.refunded')

const revenueDelta = (event: schemas['Event']): number => {
  if (!isOrderEvent(event)) return 0
  const amount = Number(
    event.name === 'order.paid'
      ? event.metadata.amount
      : event.metadata.refunded_amount,
  )
  return event.name === 'order.refunded' ? -Math.abs(amount) : Math.abs(amount)
}

const buildLifecycleMilestone = (event: schemas['Event']): Milestone | null => {
  const definition = LIFECYCLE_MILESTONES[event.name]
  if (!definition) return null
  return {
    label: definition.label,
    timestamp: event.timestamp,
    variant: definition.variant,
  }
}

const buildCrossedRevenueMilestones = (
  previousBilled: number,
  currentBilled: number,
  timestamp: string,
): Milestone[] =>
  REVENUE_MILESTONE_THRESHOLDS.filter(
    (threshold) => threshold > previousBilled && threshold <= currentBilled,
  ).map((threshold) => ({
    label: `Gross billed passed ${formatCurrency('statistics')(threshold, 'usd')}`,
    timestamp,
    variant: 'positive',
  }))

export const useTimelineItems = (
  events: schemas['Event'][],
): TimelineItem[] => {
  return useMemo(() => {
    const items: TimelineItem[] = []
    let currentDateKey: string | null = null
    let currentDateHeader: Extract<
      TimelineItem,
      { type: 'date-header' }
    > | null = null
    let cumulativeBilled = 0

    for (const event of events) {
      let milestoneIndex = 0
      const dateKey = calendarDateKey(event.timestamp)
      if (dateKey !== currentDateKey) {
        currentDateHeader = {
          type: 'date-header',
          date: dateKey,
          cumulativeBilled: { total: cumulativeBilled },
        }
        items.push(currentDateHeader)
        currentDateKey = dateKey
      }

      const previousBilled = cumulativeBilled
      cumulativeBilled += revenueDelta(event)
      if (currentDateHeader) {
        currentDateHeader.cumulativeBilled = { total: cumulativeBilled }
      }

      const lifecycleMilestone = buildLifecycleMilestone(event)
      if (lifecycleMilestone) {
        items.push({
          type: 'milestone',
          eventId: event.id,
          index: milestoneIndex++,
          milestone: lifecycleMilestone,
        })
      }

      for (const milestone of buildCrossedRevenueMilestones(
        previousBilled,
        cumulativeBilled,
        event.timestamp,
      )) {
        items.push({
          type: 'milestone',
          eventId: event.id,
          index: milestoneIndex++,
          milestone,
        })
      }

      items.push({ type: 'event', event })
    }

    return items
  }, [events])
}
