import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ParticipantForm } from '../components/ParticipantForm'

export default async function CreateParticipantPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [{ docs: eventDocs }, { docs: typeDocs }] = await Promise.all([
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
      collection: 'participant-types',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: 'name',
      select: { name: true },
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const participantTypes = typeDocs.map((t) => ({ id: t.id, name: t.name as string }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add participant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details to add a new participant.
        </p>
      </div>
      <ParticipantForm
        mode="create"
        events={events}
        participantTypes={participantTypes}
        defaultEventId={eventId ? Number(eventId) : undefined}
      />
    </div>
  )
}
