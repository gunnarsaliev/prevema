import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getCachedPartnerTypes, getCachedUserOrgIds } from '@/lib/cached-queries'

import { PartnerTypesTable } from './components/PartnerTypesTable'
import { PartnerTypesTableSkeleton } from './components/PartnerTypesTableSkeleton'

async function PartnerTypesData({ organizationIds }: { organizationIds: number[] }) {
  const types = await getCachedPartnerTypes(organizationIds)
  return <PartnerTypesTable types={types as any} />
}

export default async function DashboardPartnerTypesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Partner Types</h1>
          <p className="text-sm text-muted-foreground">
            Types that define required fields for partner registration.
          </p>
        </header>

        <Suspense fallback={<PartnerTypesTableSkeleton />}>
          <PartnerTypesData organizationIds={organizationIds} />
        </Suspense>
      </div>
    </div>
  )
}
