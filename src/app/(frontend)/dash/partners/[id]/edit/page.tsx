import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnerForm } from '../../components/PartnerForm'
import type { PartnerFormValues } from '@/lib/schemas/partner'

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [partner, { docs: eventDocs }, { docs: typeDocs }, { docs: tierDocs }] = await Promise.all([
    payload
      .findByID({
        collection: 'partners',
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
      collection: 'partner-types',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: 'name',
      select: { name: true },
    }),
    payload.find({
      collection: 'partner-tiers',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: 'name',
      select: { name: true },
    }),
  ])

  if (!partner) notFound()

  // Resolve relationships to their numeric IDs (depth:0 returns IDs, but types allow objects)
  const resolveId = (rel: unknown): number | undefined => {
    if (!rel) return undefined
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return undefined
  }

  const defaultValues: PartnerFormValues = {
    companyName: partner.companyName,
    event: resolveId(partner.event) ?? 0,
    partnerType: resolveId(partner.partnerType) ?? 0,
    contactPerson: partner.contactPerson,
    contactEmail: partner.contactEmail,
    email: partner.email ?? null,
    fieldOfExpertise: partner.fieldOfExpertise ?? null,
    companyWebsiteUrl: partner.companyWebsiteUrl ?? null,
    companyLogoUrl: partner.companyLogoUrl ?? null,
    companyDescription: partner.companyDescription ?? null,
    tier: resolveId(partner.tier) ?? null,
    sponsorshipLevel: partner.sponsorshipLevel ?? null,
    status: (partner.status as PartnerFormValues['status']) ?? 'default',
    additionalNotes: partner.additionalNotes ?? null,
  }

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const partnerTypes = typeDocs.map((t) => ({ id: t.id, name: t.name as string }))
  const tiers = tierDocs.map((t) => ({ id: t.id, name: t.name as string }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit partner</h1>
        <p className="text-sm text-muted-foreground mt-1">{partner.companyName}</p>
      </div>
      <PartnerForm
        mode="edit"
        partnerId={String(partner.id)}
        defaultValues={defaultValues}
        events={events}
        partnerTypes={partnerTypes}
        tiers={tiers}
      />
    </div>
  )
}
