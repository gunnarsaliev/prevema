'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  // Left side - Event Switcher or other primary filter
  primaryFilter?: ReactNode

  // Search input
  searchSlot?: ReactNode

  // Additional filters (dropdowns, selects, etc.)
  filters?: ReactNode

  // Right actions (buttons, etc.)
  actions?: ReactNode

  // Sticky positioning
  sticky?: boolean

  // Custom className
  className?: string
}

export function FilterBar({
  primaryFilter,
  searchSlot,
  filters,
  actions,
  sticky = false,
  className,
}: FilterBarProps) {
  // Don't render if no content provided
  if (!primaryFilter && !searchSlot && !filters && !actions) {
    return null
  }

  return (
    <div
      className={cn(
        'border-b border-border bg-white dark:bg-background px-6 py-3',
        sticky && 'sticky top-0 z-30',
        className,
      )}
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Left: Primary Filter (Event Switcher) */}
        {primaryFilter && (
          <div className="flex items-center min-w-0 flex-shrink-0">{primaryFilter}</div>
        )}

        {/* Search */}
        {searchSlot && (
          <div className="flex items-center min-w-0 flex-1 max-w-md">{searchSlot}</div>
        )}

        {/* Additional Filters */}
        {filters && (
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">{filters}</div>
        )}

        {/* Right: Actions */}
        {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-auto">{actions}</div>}
      </div>
    </div>
  )
}
