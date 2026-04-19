'use client'

import type { Milestone } from './buildTimelineItems'
import { cva } from 'class-variance-authority'

const milestoneBadgeVariants = cva('text-xxs! rounded-sm px-2 py-1 font-mono', {
  variants: {
    variant: {
      positive:
        'bg-emerald-100 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-500',
      negative: 'bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-500',
      neutral: 'bg-blue-100 text-blue-500 dark:bg-blue-950 dark:text-blue-500',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

export const TimelineMilestone = ({ milestone }: { milestone: Milestone }) => {
  return (
    <div className="relative flex gap-x-3 pb-2">
      <div className="relative z-10 flex w-6 shrink-0 items-center justify-center">
        <div className="dark:bg-polar-700 size-2 rounded-sm bg-gray-200" />
      </div>
      <div className={milestoneBadgeVariants({ variant: milestone.variant })}>
        {milestone.label}
      </div>
    </div>
  )
}
