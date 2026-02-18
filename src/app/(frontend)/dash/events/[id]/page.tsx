import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { format } from 'date-fns'
import Link from 'next/link'
import config from '@/payload.config'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { ParticipantType, PartnerType } from '@/payload-types'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planning: 'secondary',
  open: 'default',
  closed: 'outline',
  archived: 'destructive',
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function TypesSection({
  title,
  items,
  editBasePath,
  createHref,
}: {
  title: string
  items: (ParticipantType | PartnerType)[]
  editBasePath: string
  createHref: string
}) {
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h2>
        <Button variant="outline" size="sm" asChild>
          <Link href={createHref}>Add</Link>
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No {title.toLowerCase()} linked to this event yet.
        </p>
      ) : (
        <div className="divide-y rounded-md border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.isActive ? (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  {Array.isArray(item.requiredFields) && item.requiredFields.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.requiredFields.length} required fields
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.publicFormLink && <CopyLinkButton url={item.publicFormLink} />}
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`${editBasePath}/${item.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Inline copy button — needs to be a client island; use a simple anchor instead
// for a server-only page. We render a plain link that opens the form URL.
function CopyLinkButton({ url }: { url: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Form link
      </a>
    </Button>
  )
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [event, { docs: participantTypes }, { docs: partnerTypes }] = await Promise.all([
    payload
      .findByID({
        collection: 'events',
        id: Number(id),
        overrideAccess: false,
        user,
        depth: 0,
      })
      .catch(() => null),
    payload.find({
      collection: 'participant-types',
      overrideAccess: false,
      user,
      where: { event: { equals: Number(id) } },
      depth: 0,
      limit: 100,
      sort: 'name',
    }),
    payload.find({
      collection: 'partner-types',
      overrideAccess: false,
      user,
      where: { event: { equals: Number(id) } },
      depth: 0,
      limit: 100,
      sort: 'name',
    }),
  ])

  if (!event) notFound()

  return (
    <div className="px-6 py-8 max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{event.name}</h1>
          {event.theme && <p className="text-sm text-muted-foreground mt-1">{event.theme}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge variant={STATUS_VARIANT[event.status ?? 'planning']}>
            {event.status ?? 'planning'}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dash/events/${event.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Event type" value={event.eventType} />
        <Field label="Timezone" value={event.timezone} />
        <Field
          label="Start date"
          value={
            event.startDate ? format(new Date(event.startDate), 'dd MMM yyyy, HH:mm') : undefined
          }
        />
        <Field
          label="End date"
          value={event.endDate ? format(new Date(event.endDate), 'dd MMM yyyy, HH:mm') : undefined}
        />
        {event.eventType === 'physical' && <Field label="Address" value={event.address} />}
      </div>

      {event.description && (
        <>
          <Separator />
          <Field label="Description" value={event.description} />
        </>
      )}

      {(event.why || event.what || event.where || event.who) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Context
            </h2>
            <Field label="Why" value={event.why} />
            <Field label="What" value={event.what} />
            <Field label="Where" value={event.where} />
            <Field label="Who" value={event.who} />
          </div>
        </>
      )}

      <Separator />

      <TypesSection
        title="Participant types"
        items={participantTypes}
        editBasePath="/dash/participant-types"
        createHref={`/dash/participant-types/create?eventId=${event.id}`}
      />

      <Separator />

      <TypesSection
        title="Partner types"
        items={partnerTypes}
        editBasePath="/dash/partner-types"
        createHref={`/dash/partner-types/create?eventId=${event.id}`}
      />

      <Separator />
      <Button variant="outline" asChild>
        <Link href="/dash/events">Back to events</Link>
      </Button>
    </div>
  )
}
