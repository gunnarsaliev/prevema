import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { TopBar } from '@/components/shared/TopBar'

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

  const organizationIds = await getUserOrganizationIds(payload, user)

  const [{ docs: eventDocs }, { docs: typeDocs }, { docs: orgDocs }] = await Promise.all([
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
      select: { name: true },
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
  const participantRoles = typeDocs.map((t) => ({ id: t.id, name: t.name as string }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Add Participant"
        description="Fill in the details to add a new participant"
        backHref="/dash/participants"
        backTitle="Back to participants"
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <ParticipantForm
            mode="create"
            events={events}
            participantRoles={participantRoles}
            organizations={organizations}
            defaultEventId={eventId ? Number(eventId) : undefined}
          />
        </div>
      </div>
    </div>
  )
}
