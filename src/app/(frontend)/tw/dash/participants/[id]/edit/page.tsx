import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { ParticipantForm } from '../../create/ParticipantForm'
import type { ParticipantFormValues } from '@/lib/schemas/participant'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const participant = await payload
    .findByID({ collection: 'participants', id: Number(id), depth: 0, overrideAccess: true })
    .catch(() => null)
  return { title: participant?.name ?? 'Edit Participant' }
}

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

  const participant = await payload
    .findByID({
      collection: 'participants',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1,
    })
    .catch(() => null)

  if (!participant) notFound()

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const orgId =
    typeof participant.organization === 'object' && participant.organization !== null
      ? (participant.organization as { id: number }).id
      : (participant.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const eventId =
    typeof participant.event === 'object' && participant.event !== null
      ? (participant.event as { id: number }).id
      : (participant.event as number)

  const eventName =
    typeof participant.event === 'object' && participant.event !== null && 'name' in participant.event
      ? (participant.event as { name: string }).name
      : String(eventId)

  const existingPhotoUrl =
    participant.imageUrl &&
    typeof participant.imageUrl === 'object' &&
    'url' in participant.imageUrl
      ? (participant.imageUrl as { url?: string | null }).url ?? null
      : null

  const { docs: participantRoles } = await payload.find({
    collection: 'participant-roles',
    where: { organization: { in: organizationIds } },
    depth: 0,
    limit: 200,
    select: { name: true },
    overrideAccess: true,
  })

  const defaultValues: ParticipantFormValues = {
    name: participant.name,
    email: participant.email,
    event: eventId,
    participantRole:
      typeof participant.participantRole === 'object' && participant.participantRole !== null
        ? (participant.participantRole as { id: number }).id
        : (participant.participantRole as number),
    status: participant.status ?? 'not-approved',
    imageUrl:
      participant.imageUrl && typeof participant.imageUrl === 'object'
        ? (participant.imageUrl as { id: number }).id
        : (participant.imageUrl as number | null | undefined) ?? null,
    biography: participant.biography ?? null,
    country: participant.country ?? null,
    phoneNumber: participant.phoneNumber ?? null,
    companyLogoUrl:
      participant.companyLogoUrl && typeof participant.companyLogoUrl === 'object'
        ? (participant.companyLogoUrl as { id: number }).id
        : (participant.companyLogoUrl as number | null | undefined) ?? null,
    companyName: participant.companyName ?? null,
    companyPosition: participant.companyPosition ?? null,
    companyWebsite: participant.companyWebsite ?? null,
    internalNotes: participant.internalNotes ?? null,
    presentationTopic: participant.presentationTopic ?? null,
    presentationSummary: participant.presentationSummary ?? null,
    technicalRequirements: participant.technicalRequirements ?? null,
  }

  return (
    <div className="px-8 py-8">
      <ParticipantForm
        mode="edit"
        participantId={id}
        eventId={eventId}
        eventName={eventName}
        participantRoles={participantRoles.map((r) => ({ id: r.id, name: r.name }))}
        defaultValues={defaultValues}
        existingPhotoUrl={existingPhotoUrl}
      />
    </div>
  )
}
