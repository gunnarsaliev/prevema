import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'
import { format } from 'date-fns'

import type { Event, Media } from '@/payload-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventCardSimple } from '@/components/event-card-simple'

interface Props {
  events: Event[]
  canEdit: boolean
}

function getImageUrl(image: Event['image']): string | null {
  if (image && typeof image === 'object' && 'url' in image) {
    return (image as Media).url || null
  }
  return null
}

function getLocation(event: Event): string {
  if (event.where) return event.where
  if (event.address) return event.address
  if (event.eventType === 'online') return 'Online'
  return 'Location TBA'
}

function getDescription(event: Event): string {
  return event.description || event.what || 'No description available'
}

export function EventsGrid({ events, canEdit }: Props) {
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
          <CalendarPlus className="size-10 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold">No events yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {canEdit
              ? 'Create your first event to get started planning.'
              : 'No events have been created in your organization yet.'}
          </p>
          {canEdit ? (
            <Button asChild className="mt-2">
              <Link href="/dash/events/create">Create event</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => {
        const start = event.startDate ? new Date(event.startDate) : null
        return (
          <Link
            key={event.id}
            href={`/dashboard/events/${event.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <EventCardSimple
              image={getImageUrl(event.image)}
              day={start ? Number(format(start, 'd')) : '—'}
              month={start ? format(start, 'MMM') : '—'}
              location={getLocation(event)}
              title={event.name}
              description={getDescription(event)}
            />
          </Link>
        )
      })}
    </div>
  )
}
