import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TopBar } from '@/components/shared/TopBar'

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
      depth: 1, // Fetch image data
    })
    .catch(() => null)

  if (!event) notFound()

  // Resolve organization to a number (depth: 1 returns objects for relationships)
  const orgId = typeof event.organization === 'object' ? event.organization.id : event.organization

  // Extract image URL if it exists
  const imageUrl =
    event.image && typeof event.image === 'object' && 'url' in event.image
      ? (event.image.url as string)
      : null

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
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Edit Event"
        description={event.name}
        backHref={`/dash/events/${event.id}`}
        backTitle="Back to event details"
      />
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="px-6 py-8">
          {/* organizations not passed on edit — org is locked to the event's existing value */}
          <EventForm
            mode="edit"
            eventId={String(event.id)}
            defaultValues={defaultValues}
            existingImageUrl={imageUrl}
          />
        </div>
      </div>
    </div>
  )
}
