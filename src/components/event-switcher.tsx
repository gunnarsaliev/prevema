'use client'

import { Check, ChevronsUpDown, Plus, Calendar, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Event = {
  id: string
  name: string
  slug: string
  status: 'planning' | 'open' | 'closed' | 'archived'
  startDate: string
  endDate?: string
}

const statusColors = {
  planning: 'bg-yellow-500/10 text-yellow-500',
  open: 'bg-green-500/10 text-green-500',
  closed: 'bg-gray-500/10 text-gray-500',
  archived: 'bg-gray-500/10 text-gray-500',
}

const statusLabels = {
  planning: 'Planning',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
}

export const EventSwitcher = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentEventId = searchParams.get('eventId')
  const currentEvent = events.find((e) => e.id === currentEventId)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/events')

        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()
        const eventsList = data.docs || []
        setEvents(eventsList)

        // Auto-select first event if none selected and events exist
        if (!currentEventId && eventsList.length > 0) {
          const params = new URLSearchParams(searchParams.toString())
          params.set('eventId', eventsList[0].id)
          router.replace(`${pathname}?${params.toString()}`)
        }
      } catch (err) {
        console.error('Failed to fetch events:', err)
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, []) // Only run once on mount

  const handleEventSelect = (eventId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('eventId', eventId)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleCreateEvent = () => {
    // Navigate to PayloadCMS admin to create new event
    window.open('/admin/collections/events/create', '_blank')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <Button className="h-auto w-full justify-between py-2 px-2" variant="outline" disabled>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading events...</span>
        </div>
      </Button>
    )
  }

  if (error || events.length === 0) {
    return (
      <Button
        onClick={handleCreateEvent}
        className="h-auto w-full justify-between py-2 px-2"
        variant="outline"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">No events - Create one</span>
        </div>
        <Plus className="h-4 w-4 shrink-0" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-auto w-full justify-between py-2 px-2" variant="outline">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                <Calendar className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate">
                {currentEvent?.name || 'Select Event'}
              </span>
              {currentEvent && (
                <span className="text-xs text-muted-foreground truncate">
                  {formatDate(currentEvent.startDate)}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100%-1rem)] min-w-64" sideOffset={4}>
        <DropdownMenuLabel>Events</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {events.map((event) => {
          const isSelected = event.id === currentEventId
          return (
            <DropdownMenuItem
              key={event.id}
              onClick={() => handleEventSelect(event.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <Calendar className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{event.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[event.status]}`}
                  >
                    {statusLabels[event.status]}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {formatDate(event.startDate)}
                </span>
              </div>
              {isSelected && <Check className="ml-auto h-4 w-4 shrink-0" />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateEvent} className="cursor-pointer">
          <Plus className="h-4 w-4" />
          Create New Event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
