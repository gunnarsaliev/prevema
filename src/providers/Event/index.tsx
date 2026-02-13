'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type Event = {
  id: string
  name: string
}

type EventContextType = {
  events: Event[]
  selectedEvent: Event | null
  selectEvent: (eventId: string) => void
}

const EventContext = createContext<EventContextType>({
  events: [],
  selectedEvent: null,
  selectEvent: () => {},
})

export function EventProvider({
  children,
  initialEvents,
}: {
  children: React.ReactNode
  initialEvents: Event[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [events] = useState<Event[]>(initialEvents)

  // Initialise selectedId from URL, falling back to first event
  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get('eventId') ?? initialEvents[0]?.id ?? null,
  )

  // Sync URL on mount if eventId is missing
  useEffect(() => {
    if (selectedId && !searchParams.get('eventId')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('eventId', selectedId)
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEvent = events.find((e) => e.id === selectedId) ?? null

  const selectEvent = useCallback(
    (eventId: string) => {
      // Update state immediately — no waiting for URL to re-parse
      setSelectedId(eventId)
      const params = new URLSearchParams(searchParams.toString())
      params.set('eventId', eventId)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <EventContext.Provider value={{ events, selectedEvent, selectEvent }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvent(): EventContextType {
  return useContext(EventContext)
}
