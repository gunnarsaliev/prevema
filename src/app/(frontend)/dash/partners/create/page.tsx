import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnerForm } from '../components/PartnerForm'

export default async function CreatePartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Fetch events, partner-types and partner-tiers in parallel
  const [{ docs: eventDocs }, { docs: typeDocs }, { docs: tierDocs }] = await Promise.all([
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
      limit: 100,
      sort: 'name',
      select: { name: true },
    }),
    payload.find({
      collection: 'partner-tiers',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: 'name',
      select: { name: true },
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const partnerTypes = typeDocs.map((t) => ({ id: t.id, name: t.name as string }))
  const tiers = tierDocs.map((t) => ({ id: t.id, name: t.name as string }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add partner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details to add a new partner.
        </p>
      </div>
      <PartnerForm
        mode="create"
        events={events}
        partnerTypes={partnerTypes}
        tiers={tiers}
        defaultEventId={eventId ? Number(eventId) : undefined}
      />
    </div>
  )
}
