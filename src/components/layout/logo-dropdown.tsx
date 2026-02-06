import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Calendar, Loader2 } from 'lucide-react'
import { LogoImage } from '../logo'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  slug: string
  status: string
  startDate: string
  endDate: string
}

interface LogoDropdownProps {
  isCollapsed?: boolean
}

export function LogoDropdown({ isCollapsed = false }: LogoDropdownProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isCollapsed) {
      fetchEvents()
    }
  }, [isCollapsed])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  return (
    <DropdownMenu>
      <div className="flex w-full items-center group-data-[collapsible=icon]:justify-center">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-auto items-center gap-3 p-0! hover:bg-transparent"
          >
            <LogoImage src="/logo.png" alt="Prevema" className="h-8 w-8 rounded-sm bg-muted p-1" />
            {!isCollapsed && (
              <>
                <span className="font-semibold">Prevema</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-56 z-[60]" align="start">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Workspace settings</DropdownMenuItem>
          <DropdownMenuItem>Invite teammates</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>

        {events.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Events</DropdownMenuLabel>
            <DropdownMenuGroup>
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              ) : (
                events.slice(0, 5).map((event) => (
                  <DropdownMenuItem key={event.id} asChild>
                    <Link href={`/dash/events/${event.slug}`} className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <div className="flex flex-col">
                        <span className="text-sm">{event.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.startDate)}
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
              {events.length > 5 && (
                <DropdownMenuItem asChild>
                  <Link href="/dash/events" className="text-xs text-muted-foreground">
                    View all events →
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
