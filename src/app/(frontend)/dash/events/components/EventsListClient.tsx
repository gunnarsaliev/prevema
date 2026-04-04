'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/shared/TopBar'
import { EventsList } from './EventsList'
import type { Event } from '@/payload-types'
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

export function EventsListClient({ events }: Props) {
  const { canEdit, role } = usePermissions()

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Events"
        description="Manage and view your events"
        actions={
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
                  <p>You don&apos;t have permission to create events ({role} role)</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        }
      />
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="px-6 py-8">
          <EventsList events={events} />
        </div>
      </div>
    </div>
  )
}
