'use client'

import { EventsList } from './EventsList'
import type { Event } from '@/payload-types'

interface Props {
  events: Event[]
}

export function EventsListClient({ events }: Props) {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="px-8 py-8">
          <EventsList events={events} />
        </div>
      </div>
    </div>
  )
}
