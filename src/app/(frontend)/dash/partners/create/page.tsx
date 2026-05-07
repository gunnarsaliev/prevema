import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { PartnerForm } from './PartnerForm'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashEvents } from '../../events/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Partner',
}

export default async function CreatePartnerPage({
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
    // Verify the event belongs to the user's org
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

  const [{ docs: partnerTypes }, { docs: tiers }] = await Promise.all([
    payload.find({
      collection: 'partner-types',
      where: { organization: { in: organizationIds } },
      depth: 0,
      limit: 200,
      select: { name: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'partner-tiers',
      where: { organization: { in: organizationIds } },
      depth: 0,
      limit: 200,
      select: { name: true },
      overrideAccess: true,
    }),
  ])

  return (
    <>
      <DashBreadcrumb
        items={[{ label: 'Partners', href: '/dash/partners' }, { label: 'Create' }]}
      />
      <div className="px-8 py-8">
        <PartnerForm
          mode="create"
          eventId={preselectedEvent?.id}
          eventName={preselectedEvent?.name}
          events={preselectedEvent ? undefined : allEvents}
          partnerTypes={partnerTypes.map((t) => ({ id: t.id, name: t.name }))}
          tiers={tiers.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </>
  )
}
