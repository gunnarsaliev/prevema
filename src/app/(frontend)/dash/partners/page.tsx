import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnersList } from './components/PartnersList'
import { EmptyEventState } from '@/components/EmptyEventState'
import { EmptyPartnerTypeState } from '@/components/EmptyPartnerTypeState'

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [{ docs: partners }, { docs: eventDocs }, { docs: partnerTypes }] = await Promise.all([
    payload.find({
      collection: 'partners',
      overrideAccess: false,
      user,
      depth: 1, // resolve partnerType and tier names
      limit: 500,
      sort: 'companyName',
      ...(eventId
        ? { where: { event: { equals: Number(eventId) } } }
        : {}),
    }),
    payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 200,
      sort: 'name',
      select: { id: true, name: true },
    }),
    payload.find({
      collection: 'partner-types',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 1,
      select: { id: true },
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))

  // Show empty state if no events exist
  if (events.length === 0) {
    return <EmptyEventState />
  }

  // Show empty state if no partner types exist
  if (partnerTypes.length === 0) {
    return <EmptyPartnerTypeState />
  }

  return (
    <div className="px-6 py-8">
      <PartnersList partners={partners} events={events} eventId={eventId} />
    </div>
  )
}
