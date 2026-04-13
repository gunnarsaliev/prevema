import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { getCachedPartnerTypes } from '@/lib/cached-queries'
import { PartnerTypesList } from './components/PartnerTypesList'
import { PartnerTypesListSkeleton } from './components/PartnerTypesListSkeleton'

async function PartnerTypesData({ organizationIds }: { organizationIds: number[] }) {
  const partnerTypes = await getCachedPartnerTypes(organizationIds)

  return <PartnerTypesList partnerTypes={partnerTypes as any} />
}

export default async function PartnerTypesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <Suspense fallback={<PartnerTypesListSkeleton />}>
        <PartnerTypesData organizationIds={organizationIds} />
      </Suspense>
    </div>
  )
}
