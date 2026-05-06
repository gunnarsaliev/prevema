import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds, getCachedParticipantRoles } from '@/lib/cached-queries'
import { getTwDashEvents } from '../../events/data'
import { ParticipantForm } from './ParticipantForm'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
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

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  let preselectedEvent: { id: number; name: string } | null = null
  let allEvents: { id: number; name: string }[] = []

  if (eventId) {
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

    preselectedEvent = { id: event.id, name: event.name }
  } else {
    const events = await getTwDashEvents(userId, organizationIds)
    allEvents = events.map((e) => ({ id: e.id, name: e.name }))
  }

  const participantRoles = await getCachedParticipantRoles(organizationIds)

  return (
    <>
      <DashBreadcrumb
        items={[{ label: 'Participants', href: '/tw/dash/participants' }, { label: 'Create' }]}
      />
      <div className="px-8 py-8">
        <ParticipantForm
          mode="create"
          eventId={preselectedEvent?.id}
          eventName={preselectedEvent?.name}
          events={preselectedEvent ? undefined : allEvents}
          participantRoles={participantRoles.map((r) => ({ id: r.id, name: r.name }))}
        />
      </div>
    </>
  )
}
