import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { TopBar } from '@/components/shared/TopBar'

import { PartnerTypeForm } from '../../components/PartnerTypeForm'
import type { PartnerTypeFormValues } from '@/lib/schemas/partner-type'

export default async function EditPartnerTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Get all organization IDs where user is a member (including as owner)
  const organizationIds = await getUserOrganizationIds(payload, user)

  const [partnerType, { docs: orgDocs }] = await Promise.all([
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
      collection: 'organizations',
      where: {
        id: {
          in: organizationIds,
        },
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
    isActive: partnerType.isActive ?? true,
    requiredFields: (partnerType.requiredFields as PartnerTypeFormValues['requiredFields']) ?? [],
    showOptionalFields: partnerType.showOptionalFields ?? false,
    optionalFields: (partnerType.optionalFields as PartnerTypeFormValues['optionalFields']) ?? [],
  }

  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Edit Partner Type"
        description={partnerType.name}
        backHref="/dash/partner-types"
        backTitle="Back to partner types"
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <PartnerTypeForm
            mode="edit"
            partnerTypeId={String(partnerType.id)}
            defaultValues={defaultValues}
            organizations={organizations}
          />
        </div>
      </div>
    </div>
  )
}
