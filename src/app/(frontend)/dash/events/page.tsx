import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { EventsListClient } from './components/EventsListClient'
import { EventsListSkeleton } from './components/EventsListSkeleton'
import type { Event } from '@/payload-types'

async function EventsData() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  const { docs } = await payload.find({
    collection: 'events',
    overrideAccess: false,
    user,
    depth: 1,
    limit: 200,
    sort: '-createdAt',
  })

  return <EventsListClient events={docs as Event[]} />
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
