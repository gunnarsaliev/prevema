import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { EventForm } from '../../components/EventForm'
import type { EventFormValues } from '@/lib/schemas/event'

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
      depth: 0,
    })
    .catch(() => null)

  if (!event) notFound()

  // Resolve organization to a number (depth: 0 returns IDs, but type is number | Organization)
  const orgId = typeof event.organization === 'object' ? event.organization.id : event.organization

  const defaultValues: EventFormValues = {
    organization: orgId,
    name: event.name,
    status: event.status ?? 'planning',
    startDate: event.startDate,
    endDate: event.endDate ?? null,
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
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit event</h1>
        <p className="text-sm text-muted-foreground mt-1">{event.name}</p>
      </div>
      {/* organizations not passed on edit — org is locked to the event's existing value */}
      <EventForm mode="edit" eventId={String(event.id)} defaultValues={defaultValues} />
    </div>
  )
}
