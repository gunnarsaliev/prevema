import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { DashClientLayout } from './client-layout'
import type { Event } from '@/providers/Event'

/**
 * Server-side layout for /dash routes.
 * Authenticates the user and pre-fetches their events using the Payload local API,
 * so the client layout has events available on the first render.
 */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  const { docs } = await payload.find({
    collection: 'events',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 100,
    sort: '-createdAt',
    select: { id: true, name: true },
  })

  const initialEvents = docs as Event[]

  return <DashClientLayout initialEvents={initialEvents}>{children}</DashClientLayout>
}
