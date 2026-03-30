'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Partner status configuration
const PARTNER_STATUSES = [
  { value: 'default', label: 'Default', variant: 'secondary' as const },
  { value: 'contacted', label: 'Contacted', variant: 'default' as const },
  { value: 'confirmed', label: 'Confirmed', variant: 'default' as const },
  { value: 'declined', label: 'Declined', variant: 'destructive' as const },
]

// Participant status configuration
const PARTICIPANT_STATUSES = [
  { value: 'not-approved', label: 'Not Approved', variant: 'secondary' as const },
  { value: 'approved', label: 'Approved', variant: 'default' as const },
  { value: 'need-info', label: 'Need Info', variant: 'outline' as const },
  { value: 'cancelled', label: 'Cancelled', variant: 'destructive' as const },
]

interface StatusSelectProps {
  entityType: 'partner' | 'participant'
  entityId: number
  currentStatus: string
  onStatusChange?: () => void
}

export function StatusSelect({
  entityType,
  entityId,
  currentStatus,
  onStatusChange,
}: StatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Optimistic status state - starts with current status from props
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)

  const statuses = entityType === 'partner' ? PARTNER_STATUSES : PARTICIPANT_STATUSES
  // Use optimistic status for display
  const displayStatusConfig = statuses.find((s) => s.value === optimisticStatus) || statuses[0]
  const apiEndpoint = entityType === 'partner' ? '/api/partners' : '/api/participants'

  // Sync optimistic status when currentStatus prop changes (e.g., after table refresh)
  useEffect(() => {
    setOptimisticStatus(currentStatus)
  }, [currentStatus])

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === optimisticStatus) {
      setOpen(false)
      return
    }

    // Optimistic update - update UI immediately
    const previousStatus = optimisticStatus
    setOptimisticStatus(newStatus)
    setOpen(false)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiEndpoint}/${entityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update status')
      }

      // Call the callback to refresh the table (optional since we have optimistic update)
      onStatusChange?.()
    } catch (err) {
      console.error('Failed to update status:', err)
      // Revert to previous status on error
      setOptimisticStatus(previousStatus)
      setError(err instanceof Error ? err.message : 'Failed to update status')
      setOpen(true) // Reopen popover to show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          disabled={loading}
        >
          <Badge variant={displayStatusConfig.variant} className="cursor-pointer">
            {loading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                {displayStatusConfig.label}
              </>
            ) : (
              displayStatusConfig.label
            )}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-1">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                'disabled:pointer-events-none disabled:opacity-50',
                optimisticStatus === status.value && 'bg-accent'
              )}
            >
              <span className="flex items-center gap-2">
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </span>
              {optimisticStatus === status.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
        {error && (
          <div className="mt-2 rounded-sm bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
