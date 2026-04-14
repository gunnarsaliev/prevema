import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import {
  DashboardStats,
  UpcomingEventSection,
  QuickStartSection,
} from './components/DashboardSections'
import {
  StatsCardsSkeleton,
  UpcomingEventSkeleton,
  QuickStartSkeleton,
} from './components/DashboardSkeletons'

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds: number[] = rawOrgIds.map(Number)

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 space-y-8">
          <Suspense fallback={<StatsCardsSkeleton />}>
            <DashboardStats organizationIds={organizationIds} />
          </Suspense>

          <Suspense fallback={<UpcomingEventSkeleton />}>
            <UpcomingEventSection organizationIds={organizationIds} />
          </Suspense>

          <Suspense fallback={<QuickStartSkeleton />}>
            <QuickStartSection organizationIds={organizationIds} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
