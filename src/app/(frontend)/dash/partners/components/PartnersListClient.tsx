'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/shared/TopBar'
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
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Partners"
        actions={
          <>
            <Button asChild>
              <Link href={createHref}>
                <Plus className="mr-2 h-4 w-4" />
                New partner
              </Link>
            </Button>
          </>
        }
      />
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="px-6 py-8">
          <PartnersList
            partners={partners}
            events={events}
            organizations={organizations}
            eventId={eventId}
          />
        </div>
      </div>
    </div>
  )
}
