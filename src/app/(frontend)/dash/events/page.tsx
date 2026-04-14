import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { getEvents } from './data'
import { EventsListClient } from './components/EventsListClient'
import { EventsListSkeleton } from './components/EventsListSkeleton'

/**
 * Server component that fetches and renders events data.
 *
 * Uses React cache() under the hood (via getEvents) to deduplicate
 * requests within the same render pass.
 */
async function EventsData() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  // Get user's organization IDs for scoped queries
  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds: number[] = rawOrgIds.map(Number)
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)

  // Fetch events with two-tier caching:
  // 1. React cache() deduplicates within this request
  // 2. unstable_cache() persists across requests
  const events = await getEvents(userId, organizationIds)

  return <EventsListClient events={events} />
}

export default async function EventsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<EventsListSkeleton />}>
        <EventsData />
      </Suspense>
    </div>
  )
}
