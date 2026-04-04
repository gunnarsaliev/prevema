import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'

import { PartnersListClient } from './components/PartnersListClient'
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

  const organizationIds = await getUserOrganizationIds(payload, user)

  const [{ docs: partners }, { docs: eventDocs }, { docs: partnerTypes }, { docs: orgDocs }] = await Promise.all([
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
      select: { name: true },
    }),
    payload.find({
      collection: 'partner-types',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'organizations',
      where: { id: { in: organizationIds } },
      depth: 0,
      limit: 100,
      select: { name: true },
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  // Show empty state if no events exist
  if (events.length === 0) {
    return <EmptyEventState />
  }

  // Show empty state if no partner types exist
  if (partnerTypes.length === 0) {
    return <EmptyPartnerTypeState />
  }

  const createHref = eventId
    ? `/dash/partners/create?eventId=${eventId}`
    : '/dash/partners/create'

  return (
    <PartnersListClient
      partners={partners}
      events={events}
      organizations={organizations}
      eventId={eventId}
      createHref={createHref}
    />
  )
}
