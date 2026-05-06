import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashParticipants } from '../participants/data'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { Heading } from '@/components/catalyst/heading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Participants',
}

export default async function AllParticipantsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  const participants = await getTwDashParticipants(userId, organizationIds)

  return (
    <>
      <DashBreadcrumb items={[{ label: 'All Participants' }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>All Participants</Heading>
        </div>
      </div>
      <div className="mt-8">
        <DataTable
          columns={columns}
          data={participants}
          searchKey="name"
          searchPlaceholder="Search participants…"
        />
      </div>
    </>
  )
}
