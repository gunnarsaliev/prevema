'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/shared/TopBar'
import { EventSwitcher } from '@/components/event-switcher'
import { NewButtonDropdown } from '@/components/shared/NewButtonDropdown'
import { Button } from '@/components/ui/button'
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

interface TypeOption {
  id: number
  name: string
}

interface Props {
  partners: Partner[]
  events: EventOption[]
  organizations: OrgOption[]
  types: TypeOption[]
  eventId?: string
  createHref: string
}

export function PartnersListClient({
  partners,
  events,
  organizations,
  types,
  eventId,
  createHref,
}: Props) {
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
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dash/partner-types">Manage types</Link>
            </Button>
            <NewButtonDropdown items={newButtonItems} />
          </>
        }
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <PartnersList
            partners={partners}
            events={events}
            organizations={organizations}
            types={types}
            eventId={eventId}
            typeDrawerOpen={typeDrawerOpen}
            onTypeDrawerChange={setTypeDrawerOpen}
          />
        </div>
      </div>
    </div>
  )
}
