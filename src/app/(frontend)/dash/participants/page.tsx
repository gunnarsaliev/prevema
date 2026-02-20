import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ParticipantsList } from './components/ParticipantsList'
import { EmptyEventState } from '@/components/EmptyEventState'
import { EmptyParticipantTypeState } from '@/components/EmptyParticipantTypeState'

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [{ docs: participants }, { docs: eventDocs }, { docs: participantTypes }] = await Promise.all([
    payload.find({
      collection: 'participants',
      overrideAccess: false,
      user,
      depth: 1, // resolve participantType name
      limit: 500,
      sort: 'name',
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
      collection: 'participant-types',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 1,
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))

  // Show empty state if no events exist
  if (events.length === 0) {
    return <EmptyEventState />
  }

  // Show empty state if no participant types exist
  if (participantTypes.length === 0) {
    return <EmptyParticipantTypeState />
  }

  return (
    <div className="px-6 py-8">
      <ParticipantsList participants={participants} events={events} eventId={eventId} />
    </div>
  )
}
