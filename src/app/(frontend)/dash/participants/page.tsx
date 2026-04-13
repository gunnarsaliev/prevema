import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { ParticipantsList } from './components/ParticipantsList'
import { ParticipantsListSkeleton } from './components/ParticipantsListSkeleton'
import { EmptyEventState } from '@/components/EmptyEventState'
import { EmptyParticipantRoleState } from '@/components/EmptyParticipantRoleState'

async function ParticipantsData({ eventId }: { eventId?: string }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  const organizationIds = await getUserOrganizationIds(payload, user)

  const [
    { docs: participants },
    { docs: eventDocs },
    { docs: participantRoles },
    { docs: orgDocs },
  ] = await Promise.all([
    payload.find({
      collection: 'participants',
      overrideAccess: false,
      user,
      depth: 1,
      limit: 500,
      sort: 'name',
      ...(eventId ? { where: { event: { equals: Number(eventId) } } } : {}),
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
      collection: 'participant-roles',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: 'name',
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
  const roles = participantRoles.map((r) => ({ id: r.id, name: r.name }))

  if (events.length === 0) return <EmptyEventState />
  if (participantRoles.length === 0) return <EmptyParticipantRoleState />

  const createHref = eventId
    ? `/dash/participants/create?eventId=${eventId}`
    : '/dash/participants/create'

  return (
    <ParticipantsList
      participants={participants}
      events={events}
      organizations={organizations}
      roles={roles}
      eventId={eventId}
      createHref={createHref}
    />
  )
}

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

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<ParticipantsListSkeleton />}>
        <ParticipantsData eventId={eventId} />
      </Suspense>
    </div>
  )
}
