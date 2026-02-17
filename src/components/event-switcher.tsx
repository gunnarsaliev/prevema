'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Icon } from '@iconify/react'

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
import { useEvent } from '@/providers/Event'
import Link from 'next/link'

const CALENDAR_ICON = 'fluent-color:calendar-32'

const handleCreateEvent = () => {
  window.open('/dash/events/create', '_blank')
}

export const EventSwitcher = () => {
  const { events, selectedEvent, selectEvent } = useEvent()

  if (events.length === 0) {
    return (
      <Button
        onClick={handleCreateEvent}
        className="h-auto w-full justify-between py-2 px-2"
        variant="outline"
      >
        <div className="flex items-center gap-2">
          <Icon icon={CALENDAR_ICON} className="h-4 w-4" />
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
                <Icon icon={CALENDAR_ICON} className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium truncate min-w-0">
              {selectedEvent?.name || 'Select Event'}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100%-1rem)] min-w-64" sideOffset={4}>
        <DropdownMenuLabel>
          <Link href="/dash/events">See all events</Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {events.map((event) => {
          const isSelected = selectedEvent?.id === event.id
          return (
            <DropdownMenuItem
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className={`flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            >
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <Icon icon={CALENDAR_ICON} className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm truncate min-w-0">{event.name}</span>
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
