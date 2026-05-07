'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, Globe, DoorOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Booking, Guest } from './types'

export const STATUS_STYLES: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
}

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Direct: Globe,
  'Booking.com': Globe,
  Expedia: Globe,
  'Walk-in': DoorOpen,
}

export function AvatarGroup({ guests, guestCount }: { guests: Guest[]; guestCount: number }) {
  if (guests.length === 0) return null
  const overflow = guestCount - guests.length
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {guests.slice(0, 4).map((a) => (
          <Avatar key={a.name} className="size-7 border-2 border-background ring-0">
            {a.avatar && <AvatarImage src={a.avatar} alt={a.name} />}
            <AvatarFallback className="bg-muted text-[10px] font-medium">{a.initials}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-2 text-xs font-medium text-muted-foreground">+{overflow}</span>
      )}
    </div>
  )
}

export function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = React.useState(false)
  const SourceIcon = SOURCE_ICONS[booking.source] || Globe

  const title = (
    <h3 className="truncate text-sm leading-snug font-semibold">
      {booking.guestName}
      {booking.roomNumber ? ` — ${booking.roomType} ${booking.roomNumber}` : ''}
    </h3>
  )

  return (
    <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div>
            {booking.href ? (
              <Link href={booking.href} className="hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">{booking.time}</p>
          </div>

          {booking.guests.length > 0 && (
            <div className="flex items-center gap-3">
              <AvatarGroup guests={booking.guests} guestCount={booking.guestCount} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SourceIcon className="size-3.5" />
              <span>via {booking.source}</span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <Badge
              variant="secondary"
              className={cn(
                'border-0 px-2 py-0 text-[11px] font-medium',
                STATUS_STYLES[booking.statusColor] || STATUS_STYLES.violet,
              )}
            >
              {booking.status}
            </Badge>
          </div>
        </div>

        {booking.specialRequests && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted"
          >
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                expanded && 'rotate-180',
              )}
            />
          </button>
        )}
      </div>

      {expanded && booking.specialRequests && (
        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Notes:</span>{' '}
            {booking.specialRequests}
          </p>
          {booking.nights > 0 && (
            <p>
              <span className="font-medium text-foreground">Duration:</span> {booking.nights} day
              {booking.nights !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
