import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { getCachedLayoutData } from '@/lib/cached-queries'

import { getDashboardEvents } from './data'
import { EventsGrid } from './components/EventsGrid'
import { EventsGridSkeleton } from './components/EventsGridSkeleton'

// Page is naturally dynamic (uses cookies/headers for auth) but the data
// fetch itself is cached via unstable_cache + tag-based revalidation.

interface EventsDataProps {
  userId: number
  organizationIds: number[]
  canEdit: boolean
}

async function EventsData({ userId, organizationIds, canEdit }: EventsDataProps) {
  const events = await getDashboardEvents(userId, organizationIds)
  return <EventsGrid events={events} canEdit={canEdit} />
}

export default async function DashboardEventsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)

  const { permissions } = await getCachedLayoutData(userId, organizationIds)

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">All events</h1>
          <p className="text-sm text-muted-foreground">
            Browse every event across your organizations.
          </p>
        </header>

        <Suspense fallback={<EventsGridSkeleton />}>
          <EventsData
            userId={userId}
            organizationIds={organizationIds}
            canEdit={permissions.canEdit}
          />
        </Suspense>
      </div>
    </div>
  )
}
