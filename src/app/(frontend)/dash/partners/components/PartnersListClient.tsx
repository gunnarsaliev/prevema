'use client'

import { useState } from 'react'
import { TopBar } from '@/components/shared/TopBar'
import { EventSwitcher } from '@/components/event-switcher'
import { NewButtonDropdown } from '@/components/shared/NewButtonDropdown'
import { PartnersList } from './PartnersList'
import type { Partner } from '@/payload-types'

interface EventOption {
  id: number
  name: string
}

interface OrgOption {
  id: number
  name: string
}

interface Props {
  partners: Partner[]
  events: EventOption[]
  organizations: OrgOption[]
  eventId?: string
  createHref: string
}

export function PartnersListClient({ partners, events, organizations, eventId, createHref }: Props) {
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false)

  const newButtonItems = [
    {
      label: 'New partner',
      href: createHref,
    },
    {
      label: 'New partner type',
      onClick: () => setTypeDrawerOpen(true),
    },
  ]

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Partners"
        centerContent={<EventSwitcher />}
        actions={
          <NewButtonDropdown items={newButtonItems} />
        }
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <PartnersList
            partners={partners}
            events={events}
            organizations={organizations}
            eventId={eventId}
            typeDrawerOpen={typeDrawerOpen}
            onTypeDrawerChange={setTypeDrawerOpen}
          />
        </div>
      </div>
    </div>
  )
}
