import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { format } from 'date-fns'
import Link from 'next/link'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ParticipantRolesSection } from './components/ParticipantRolesSection'
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

  // Get all organization IDs where user is a member (including as owner)
  const organizationIds = await getUserOrganizationIds(payload, user)

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

  // Resolve orgId early so we can use it in the shared-roles query below
  const resolveNum = (v: unknown): number | undefined =>
    typeof v === 'number'
      ? v
      : typeof v === 'object' && v !== null && 'id' in v
        ? (v as { id: number }).id
        : undefined

  const orgId = resolveNum(event.organization) ?? 0

  // Fetch all roles/types for this organization (now org-scoped only)
  const [{ docs: participantRoles }, { docs: partnerTypes }, { docs: orgDocs }] = await Promise.all(
    [
      payload.find({
        collection: 'participant-roles',
        overrideAccess: false,
        user,
        where: { organization: { equals: orgId } },
        depth: 0,
        limit: 100,
        sort: 'name',
      }),
      payload.find({
        collection: 'partner-types',
        overrideAccess: false,
        user,
        where: { organization: { equals: orgId } },
        depth: 0,
        limit: 100,
        sort: 'name',
      }),
      payload.find({
        collection: 'organizations',
        overrideAccess: false,
        user,
        where: { id: { in: organizationIds } },
        depth: 0,
        limit: 50,
        sort: 'name',
      }),
    ],
  )

  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  const participantRoleItems = participantRoles.map((pt) => ({
    id: pt.id,
    name: pt.name,
    description: pt.description ?? null,
    isActive: pt.isActive ?? null,
    requiredFields: (pt.requiredFields as string[] | null | undefined) ?? null,
    publicFormLink: pt.publicFormLink ?? null,
    organization: resolveNum(pt.organization) ?? 0,
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
    showOptionalFields: pt.showOptionalFields ?? null,
    optionalFields: (pt.optionalFields as string[] | null | undefined) ?? null,
  }))

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-6 py-8 space-y-8">
          <Separator />

          <div className="justify-between flex">
            <Field label="Event type" value={event.eventType} />
            <Field label="Timezone" value={event.timezone} />
            <Field
              label="Start date"
              value={
                event.startDate
                  ? format(new Date(event.startDate), 'dd MMM yyyy, HH:mm')
                  : undefined
              }
            />
            <Field
              label="End date"
              value={
                event.endDate ? format(new Date(event.endDate), 'dd MMM yyyy, HH:mm') : undefined
              }
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

          <ParticipantRolesSection
            items={participantRoleItems}
            eventId={event.id}
            orgId={orgId}
            organizations={organizations}
          />

          <Separator />

          <PartnerTypesSection
            items={partnerTypeItems}
            eventId={event.id}
            orgId={orgId}
            organizations={organizations}
          />
        </div>
      </div>
    </div>
  )
}
