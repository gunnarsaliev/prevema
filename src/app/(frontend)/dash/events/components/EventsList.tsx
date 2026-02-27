'use client'

import { useState } from 'react'
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

interface Props {
  events: Event[]
}

export function EventsList({ events }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const { canEdit, role } = usePermissions()

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage and view your events</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button asChild disabled={!canEdit}>
                  <Link href={canEdit ? '/dash/events/create' : '#'} className={!canEdit ? 'pointer-events-none' : ''}>
                    <Plus className="mr-2 h-4 w-4" />
                    New event
                  </Link>
                </Button>
              </div>
            </TooltipTrigger>
            {!canEdit && (
              <TooltipContent>
                <p>You don't have permission to create events ({role} role)</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Search Bar */}
      {events.length > 0 && (
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
          />
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
