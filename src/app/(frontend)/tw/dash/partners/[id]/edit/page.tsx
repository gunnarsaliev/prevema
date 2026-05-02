import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { PartnerForm } from '../../create/PartnerForm'
import type { PartnerFormValues } from '@/lib/schemas/partner'
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
  const partner = await payload
    .findByID({ collection: 'partners', id: Number(id), depth: 0, overrideAccess: true })
    .catch(() => null)
  return { title: partner?.companyName ?? 'Edit Partner' }
}

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const partner = await payload
    .findByID({
      collection: 'partners',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1,
    })
    .catch(() => null)

  if (!partner) notFound()

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const orgId =
    typeof partner.organization === 'object' && partner.organization !== null
      ? (partner.organization as { id: number }).id
      : (partner.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const eventId =
    typeof partner.event === 'object' && partner.event !== null
      ? (partner.event as { id: number }).id
      : (partner.event as number)

  const eventName =
    typeof partner.event === 'object' && partner.event !== null && 'name' in partner.event
      ? (partner.event as { name: string }).name
      : String(eventId)

  const existingLogoUrl =
    partner.companyLogo &&
    typeof partner.companyLogo === 'object' &&
    'url' in partner.companyLogo
      ? (partner.companyLogo as { url?: string | null }).url ?? null
      : null

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

  const defaultValues: PartnerFormValues = {
    companyName: partner.companyName,
    event: eventId,
    partnerType:
      typeof partner.partnerType === 'object' && partner.partnerType !== null
        ? (partner.partnerType as { id: number }).id
        : (partner.partnerType as number),
    contactPerson: partner.contactPerson,
    contactEmail: partner.contactEmail,
    email: partner.email ?? null,
    fieldOfExpertise: partner.fieldOfExpertise ?? null,
    companyWebsiteUrl: partner.companyWebsiteUrl ?? null,
    companyLogo:
      partner.companyLogo && typeof partner.companyLogo === 'object'
        ? (partner.companyLogo as { id: number }).id
        : (partner.companyLogo as number | null | undefined) ?? null,
    companyLogoUrl: partner.companyLogoUrl ?? null,
    companyBanner:
      partner.companyBanner && typeof partner.companyBanner === 'object'
        ? (partner.companyBanner as { id: number }).id
        : (partner.companyBanner as number | null | undefined) ?? null,
    companyDescription: partner.companyDescription ?? null,
    tier:
      partner.tier && typeof partner.tier === 'object'
        ? (partner.tier as { id: number }).id
        : (partner.tier as number | null | undefined) ?? null,
    sponsorshipLevel: partner.sponsorshipLevel ?? null,
    status: partner.status ?? 'default',
    additionalNotes: partner.additionalNotes ?? null,
  }

  return (
    <div className="px-8 py-8">
      <PartnerForm
        mode="edit"
        partnerId={id}
        eventId={eventId}
        eventName={eventName}
        partnerTypes={partnerTypes.map((t) => ({ id: t.id, name: t.name }))}
        tiers={tiers.map((t) => ({ id: t.id, name: t.name }))}
        defaultValues={defaultValues}
        existingLogoUrl={existingLogoUrl}
      />
    </div>
  )
}
