import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ParticipantForm } from '../../components/ParticipantForm'
import type { ParticipantFormValues } from '@/lib/schemas/participant'

export default async function EditParticipantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [participant, { docs: eventDocs }, { docs: typeDocs }] = await Promise.all([
    payload
      .findByID({
        collection: 'participants',
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
      collection: 'participant-types',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: 'name',
      select: { id: true, name: true },
    }),
  ])

  if (!participant) notFound()

  // Resolve relationships to their numeric IDs (depth:0 returns IDs, but types allow objects)
  const resolveId = (rel: unknown): number | undefined => {
    if (!rel) return undefined
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return undefined
  }

  const defaultValues: ParticipantFormValues = {
    name: participant.name,
    email: participant.email,
    event: resolveId(participant.event) ?? 0,
    participantType: resolveId(participant.participantType) ?? 0,
    status: (participant.status as ParticipantFormValues['status']) ?? 'not-approved',
    biography: participant.biography ?? null,
    country: participant.country ?? null,
    phoneNumber: participant.phoneNumber ?? null,
    companyName: participant.companyName ?? null,
    companyPosition: participant.companyPosition ?? null,
    companyWebsite: participant.companyWebsite ?? null,
    internalNotes: participant.internalNotes ?? null,
    presentationTopic: participant.presentationTopic ?? null,
    presentationSummary: participant.presentationSummary ?? null,
    technicalRequirements: participant.technicalRequirements ?? null,
  }

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const participantTypes = typeDocs.map((t) => ({ id: t.id, name: t.name as string }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit participant</h1>
        <p className="text-sm text-muted-foreground mt-1">{participant.name}</p>
      </div>
      <ParticipantForm
        mode="edit"
        participantId={String(participant.id)}
        defaultValues={defaultValues}
        events={events}
        participantTypes={participantTypes}
      />
    </div>
  )
}
