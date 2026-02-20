import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnerTypeForm } from '../../components/PartnerTypeForm'
import type { PartnerTypeFormValues } from '@/lib/schemas/partner-type'

export default async function EditPartnerTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [partnerType, { docs: eventDocs }, { docs: orgDocs }] = await Promise.all([
    payload
      .findByID({
        collection: 'partner-types',
        id: Number(id),
        overrideAccess: false,
        user,
        depth: 0,
      })
      .catch(() => null),
    payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 200,
      sort: 'name',
      select: { name: true },
    }),
    payload.find({
      collection: 'organizations',
      where: {
        or: [
          { owner: { equals: user.id } },
          { 'members.user': { equals: user.id } },
        ],
      },
      depth: 0,
      limit: 100,
      select: { name: true },
    }),
  ])

  if (!partnerType) notFound()

  // Resolve event relationship ID (depth:0 returns number but type allows object)
  const resolveId = (rel: unknown): number | null => {
    if (!rel) return null
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return null
  }

  const defaultValues: PartnerTypeFormValues = {
    organization: resolveId(partnerType.organization) ?? undefined,
    name: partnerType.name,
    description: partnerType.description ?? null,
    event: resolveId(partnerType.event),
    isActive: partnerType.isActive ?? true,
    requiredFields: (partnerType.requiredFields as PartnerTypeFormValues['requiredFields']) ?? [],
    showOptionalFields: partnerType.showOptionalFields ?? false,
    optionalFields: (partnerType.optionalFields as PartnerTypeFormValues['optionalFields']) ?? [],
  }

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit partner type</h1>
        <p className="text-sm text-muted-foreground mt-1">{partnerType.name}</p>
      </div>
      <PartnerTypeForm
        mode="edit"
        partnerTypeId={String(partnerType.id)}
        defaultValues={defaultValues}
        organizations={organizations}
        events={events}
      />
    </div>
  )
}
