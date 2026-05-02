import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { ParticipantForm } from './ParticipantForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Participant',
}

export default async function CreateParticipantPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams

  if (!eventId) notFound()

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const event = await payload
    .findByID({
      collection: 'events',
      id: Number(eventId),
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!event) notFound()

  const orgId =
    typeof event.organization === 'object' && event.organization !== null
      ? (event.organization as { id: number }).id
      : (event.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const { docs: participantRoles } = await payload.find({
    collection: 'participant-roles',
    where: { organization: { in: organizationIds } },
    depth: 0,
    limit: 200,
    select: { name: true },
    overrideAccess: true,
  })

  return (
    <div className="px-8 py-8">
      <ParticipantForm
        mode="create"
        eventId={Number(eventId)}
        eventName={event.name}
        participantRoles={participantRoles.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  )
}
