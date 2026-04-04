import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { TopBar } from '@/components/shared/TopBar'

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

  const organizationIds = await getUserOrganizationIds(payload, user)

  const [participant, { docs: eventDocs }, { docs: typeDocs }, { docs: orgDocs }] = await Promise.all([
    payload
      .findByID({
        collection: 'participants',
        id: Number(id),
        overrideAccess: false,
        user,
        depth: 1, // Fetch depth 1 to get image relationships
      })
      .catch(() => null),
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

  if (!participant) notFound()

  // Resolve relationships to their numeric IDs (depth:1 returns objects for relationships)
  const resolveId = (rel: unknown): number | undefined => {
    if (!rel) return undefined
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return undefined
  }

  // Extract image URLs from media relationships
  const getImageUrl = (media: unknown): string | null => {
    if (!media) return null
    if (typeof media === 'object' && media !== null && 'url' in media) {
      return (media as { url: string }).url
    }
    return null
  }

  const existingProfileImageUrl = getImageUrl(participant.imageUrl)
  const existingCompanyLogoUrl = getImageUrl(participant.companyLogoUrl)

  const defaultValues: ParticipantFormValues = {
    name: participant.name,
    email: participant.email,
    event: resolveId(participant.event) ?? 0,
    participantRole: resolveId(participant.participantRole) ?? 0,
    status: (participant.status as ParticipantFormValues['status']) ?? 'not-approved',
    imageUrl: resolveId(participant.imageUrl),
    biography: participant.biography ?? null,
    country: participant.country ?? null,
    phoneNumber: participant.phoneNumber ?? null,
    companyLogoUrl: resolveId(participant.companyLogoUrl),
    companyName: participant.companyName ?? null,
    companyPosition: participant.companyPosition ?? null,
    companyWebsite: participant.companyWebsite ?? null,
    internalNotes: participant.internalNotes ?? null,
    presentationTopic: participant.presentationTopic ?? null,
    presentationSummary: participant.presentationSummary ?? null,
    technicalRequirements: participant.technicalRequirements ?? null,
  }

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const participantRoles = typeDocs.map((t) => ({ id: t.id, name: t.name as string }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Edit Participant"
        description={participant.name}
        backHref={`/dash/participants/${participant.id}`}
        backTitle="Back to participant details"
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <ParticipantForm
            mode="edit"
            participantId={String(participant.id)}
            defaultValues={defaultValues}
            existingProfileImageUrl={existingProfileImageUrl}
            existingCompanyLogoUrl={existingCompanyLogoUrl}
            events={events}
            participantRoles={participantRoles}
            organizations={organizations}
          />
        </div>
      </div>
    </div>
  )
}
