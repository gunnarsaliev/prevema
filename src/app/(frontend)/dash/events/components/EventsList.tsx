'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/event-card'
import {
  getEventDay,
  getEventMonth,
  getEventLocation,
  getEventDescription,
  getEventImageUrl,
  getEventPrice,
} from '../utils/event-card-helpers'
import { usePermissions } from '@/providers/Permissions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Lazy load the search bar for better initial load performance
const EventsSearchBar = lazy(() =>
  import('./EventsSearchBar').then((mod) => ({ default: mod.EventsSearchBar })),
)

interface Props {
  events: Event[]
}

export function EventsList({ events }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const { canEdit, role } = usePermissions()

  // Memoize filtered events to avoid unnecessary recalculations
  const filteredEvents = useMemo(
    () => events.filter((event) => event.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [events, searchQuery],
  )

  return (
    <div className="space-y-8">
      {/* Search Bar - Lazy loaded */}
      {events.length > 0 && (
        <Suspense
          fallback={
            <div className="flex items-center gap-4">
              <div className="h-10 w-full max-w-sm rounded-md border border-input bg-muted/50 animate-pulse" />
            </div>
          }
        >
          <EventsSearchBar onSearchChange={setSearchQuery} />
        </Suspense>
      )}

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/dash/events/${event.id}`} className="block">
              <EventCard
                image={getEventImageUrl(event.image)}
                day={getEventDay(event.startDate)}
                month={getEventMonth(event.startDate)}
                location={getEventLocation(event)}
                title={event.name}
                description={getEventDescription(event)}
                startingPrice={getEventPrice(event)}
              />
            </Link>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {canEdit ? 'Create your first event to get started.' : 'No events have been created yet.'}
            </p>
            {canEdit ? (
              <Button asChild>
                <Link href="/dash/events/create">Create event</Link>
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button disabled>Create event</Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You don't have permission to create events ({role} role)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No events found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              No events match &quot;{searchQuery}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
