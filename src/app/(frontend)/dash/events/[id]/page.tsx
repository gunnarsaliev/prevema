import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { format } from 'date-fns'
import Link from 'next/link'
import config from '@/payload.config'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ParticipantTypesSection } from './components/ParticipantTypesSection'
import { PartnerTypesSection } from './components/PartnerTypesSection'

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

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [event, { docs: participantTypes }, { docs: partnerTypes }, { docs: orgDocs }] =
    await Promise.all([
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
      payload.find({
        collection: 'organizations',
        overrideAccess: false,
        user,
        where: {
          or: [{ owner: { equals: user.id } }, { 'members.user': { equals: user.id } }],
        },
        depth: 0,
        limit: 50,
        sort: 'name',
      }),
    ])

  if (!event) notFound()

  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))
  const eventOption = [{ id: event.id, name: event.name }]

  // Normalize items for client components (depth:0 returns numeric IDs for relations)
  const resolveNum = (v: unknown): number | undefined =>
    typeof v === 'number'
      ? v
      : typeof v === 'object' && v !== null && 'id' in v
        ? (v as { id: number }).id
        : undefined

  const orgId = resolveNum(event.organization) ?? 0

  const participantTypeItems = participantTypes.map((pt) => ({
    id: pt.id,
    name: pt.name,
    description: pt.description ?? null,
    isActive: pt.isActive ?? null,
    requiredFields: (pt.requiredFields as string[] | null | undefined) ?? null,
    publicFormLink: pt.publicFormLink ?? null,
    organization: resolveNum(pt.organization) ?? 0,
    event: resolveNum(pt.event) ?? null,
    showOptionalFields: pt.showOptionalFields ?? null,
    optionalFields: (pt.optionalFields as string[] | null | undefined) ?? null,
  }))

  const partnerTypeItems = partnerTypes.map((pt) => ({
    id: pt.id,
    name: pt.name,
    description: pt.description ?? null,
    isActive: pt.isActive ?? null,
    requiredFields: (pt.requiredFields as string[] | null | undefined) ?? null,
    publicFormLink: pt.publicFormLink ?? null,
    organization: resolveNum(pt.organization) ?? 0,
    event: resolveNum(pt.event) ?? null,
    showOptionalFields: pt.showOptionalFields ?? null,
    optionalFields: (pt.optionalFields as string[] | null | undefined) ?? null,
  }))

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
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

      <ParticipantTypesSection
        items={participantTypeItems}
        eventId={event.id}
        orgId={orgId}
        organizations={organizations}
        events={eventOption}
      />

      <Separator />

      <PartnerTypesSection
        items={partnerTypeItems}
        eventId={event.id}
        orgId={orgId}
        organizations={organizations}
        events={eventOption}
      />

      <Separator />
      <Button variant="outline" asChild>
        <Link href="/dash/events">Back to events</Link>
      </Button>
    </div>
  )
}
