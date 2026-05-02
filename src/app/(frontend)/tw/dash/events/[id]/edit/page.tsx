import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { EventForm } from '../../create/EventForm'
import type { EventFormValues } from '@/lib/schemas/event'
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
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const event = await payload
    .findByID({
      collection: 'events',
      id: Number(id),
      overrideAccess: true,
      user,
      depth: 0,
    })
    .catch(() => null)
  return { title: event?.name ?? 'Edit Event' }
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const event = await payload
    .findByID({
      collection: 'events',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1,
    })
    .catch(() => null)

  if (!event) notFound()

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const orgId =
    typeof event.organization === 'object' && event.organization !== null
      ? event.organization.id
      : event.organization

  if (!organizationIds.includes(Number(orgId))) notFound()

  const imageUrl =
    event.image && typeof event.image === 'object' && 'url' in event.image
      ? (event.image.url as string)
      : null

  const defaultValues: EventFormValues = {
    organization: orgId,
    name: event.name,
    status: event.status ?? 'planning',
    startDate: event.startDate ? event.startDate.slice(0, 16) : '',
    endDate: event.endDate ? event.endDate.slice(0, 16) : null,
    timezone: event.timezone ?? null,
    description: event.description ?? null,
    eventType: event.eventType ?? 'online',
    address: event.address ?? null,
    why: event.why ?? null,
    what: event.what ?? null,
    where: event.where ?? null,
    who: event.who ?? null,
    theme: event.theme ?? null,
  }

  return (
    <div className="px-8 py-8">
      <EventForm
        mode="edit"
        eventId={id}
        defaultValues={defaultValues}
        existingImageUrl={imageUrl}
      />
    </div>
  )
}
