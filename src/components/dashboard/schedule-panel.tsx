'use client'

import Link from 'next/link'
import { CalendarRange } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookingCard } from './booking-card'
import type { Booking } from './types'

interface SchedulePanelProps {
  bookings: Booking[]
  title?: string
  viewAllHref?: string
}

export function SchedulePanel({
  bookings,
  title = 'Upcoming Events',
  viewAllHref,
}: SchedulePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            See All
          </Link>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
        <ScrollArea className="h-full">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarRange className="mb-2 size-8 opacity-40" />
              <p className="text-sm">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
