import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ParticipantTypeForm } from '../../components/ParticipantTypeForm'
import type { ParticipantTypeFormValues } from '@/lib/schemas/participant-type'

export default async function EditParticipantTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [participantType, { docs: eventDocs }, { docs: orgDocs }] = await Promise.all([
    payload
      .findByID({
        collection: 'participant-types',
        id: Number(id),
        overrideAccess: false,
        user,
        depth: 0,
      })
      .catch(() => null),
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
      collection: 'organizations',
      where: {
        or: [
          { owner: { equals: user.id } },
          { 'members.user': { equals: user.id } },
        ],
      },
      depth: 0,
      limit: 100,
      select: { id: true, name: true },
    }),
  ])

  if (!participantType) notFound()

  // Resolve relationship ID (depth:0 returns number but type allows object)
  const resolveId = (rel: unknown): number | null => {
    if (!rel) return null
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return null
  }

  const defaultValues: ParticipantTypeFormValues = {
    organization: resolveId(participantType.organization) ?? undefined,
    name: participantType.name,
    description: participantType.description ?? null,
    event: resolveId(participantType.event),
    isActive: participantType.isActive ?? true,
    requiredFields: (participantType.requiredFields as ParticipantTypeFormValues['requiredFields']) ?? [],
    showOptionalFields: participantType.showOptionalFields ?? false,
    optionalFields: (participantType.optionalFields as ParticipantTypeFormValues['optionalFields']) ?? [],
  }

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit participant type</h1>
        <p className="text-sm text-muted-foreground mt-1">{participantType.name}</p>
      </div>
      <ParticipantTypeForm
        mode="edit"
        participantTypeId={String(participantType.id)}
        defaultValues={defaultValues}
        organizations={organizations}
        events={events}
      />
    </div>
  )
}
