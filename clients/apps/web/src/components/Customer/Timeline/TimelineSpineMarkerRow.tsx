'use client'

import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export const TimelineSpineMarkerRow = ({
  children,
  contentClassName,
}: {
  children: ReactNode
  contentClassName?: string
}) => (
  <div className="relative flex items-center pt-2 pb-4">
    <div className="relative z-10 flex w-6 shrink-0 justify-center">
      <div className="size-3 shrink-0 rounded-full border-2 border-blue-500 bg-white dark:bg-transparent" />
    </div>
    <div className="dark:bg-polar-700 -ml-1.5 h-0.5 w-3 shrink-0 bg-gray-200" />
    <div className={twMerge('flex min-w-0 flex-1', contentClassName)}>
      {children}
    </div>
  </div>
)
