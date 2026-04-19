'use client'

import { formatCurrency } from '@polar-sh/currency'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@polar-sh/ui/components/ui/tooltip'
import { cva } from 'class-variance-authority'
import { TimelineSpineMarkerRow } from './TimelineSpineMarkerRow'
import FormattedDateTime from '@polar-sh/ui/components/atoms/FormattedDateTime'

const cumulativeBilledToneVariants = cva(
  'inline-flex shrink-0 cursor-help font-mono text-xs font-medium',
  {
    variants: {
      tone: {
        missing: 'text-gray-400 dark:text-polar-500',
        zero: 'text-gray-500 dark:text-polar-500',
        positive: 'text-emerald-500 dark:text-emerald-500',
        negative: 'text-red-500 dark:text-red-500',
      },
    },
  },
)

function cumulativeBilledTone(
  billed: { total: number } | undefined,
): 'missing' | 'zero' | 'positive' | 'negative' {
  if (billed == null) {
    return 'missing'
  }
  if (billed.total === 0) {
    return 'zero'
  }
  if (billed.total > 0) {
    return 'positive'
  }
  return 'negative'
}

export const TimelineDateHeader = ({
  date,
  cumulativeBilled,
}: {
  date: string
  cumulativeBilled: { total: number } | undefined
}) => {
  const tone = cumulativeBilledTone(cumulativeBilled)

  return (
    <TimelineSpineMarkerRow contentClassName="ml-1.5 items-center justify-between gap-2">
      <span className="dark:text-polar-500 shrink-0 text-gray-500">
        <FormattedDateTime datetime={date} resolution="day" />
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cumulativeBilledToneVariants({ tone })}>
            {cumulativeBilled != null
              ? formatCurrency('subcent')(cumulativeBilled.total, 'usd')
              : '—'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Gross billed to date for selected period.
        </TooltipContent>
      </Tooltip>
    </TimelineSpineMarkerRow>
  )
}
