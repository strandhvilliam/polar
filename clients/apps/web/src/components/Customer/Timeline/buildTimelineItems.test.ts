import { schemas } from '@polar-sh/client'
import { describe, expect, it } from 'vitest'
import { buildTimelineItems } from './buildTimelineItems'

const event = (
  id: string,
  timestamp: string,
  name: string,
  metadata: Record<string, unknown> = {},
): schemas['Event'] =>
  ({
    id,
    timestamp,
    source: 'system',
    name,
    metadata,
  }) as unknown as schemas['Event']

describe('buildTimelineItems', () => {
  it('returns nothing for empty input', () => {
    expect(buildTimelineItems([])).toEqual([])
  })

  it('groups events under a date header per UTC day', () => {
    const items = buildTimelineItems([
      event('1', '2026-04-10T10:00:00Z', 'customer.updated'),
      event('2', '2026-04-11T10:00:00Z', 'customer.updated'),
    ])

    expect(items.map((i) => i.type)).toEqual([
      'date-header',
      'event',
      'date-header',
      'event',
    ])
  })

  it('emits a milestone for known lifecycle events', () => {
    const items = buildTimelineItems([
      event('1', '2026-04-10T10:00:00Z', 'customer.created'),
    ])

    expect(items.some((i) => i.type === 'milestone')).toBe(true)
  })

  it('accumulates billed revenue and emits revenue milestones when crossed', () => {
    const items = buildTimelineItems([
      event('1', '2026-04-10T10:00:00Z', 'order.paid', { amount: 20_000 }),
    ])

    const milestones = items.filter((i) => i.type === 'milestone')
    expect(milestones.length).toBeGreaterThan(0)
  })
})
