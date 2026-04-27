import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getCachedParticipantRoles, getCachedUserOrgIds } from '@/lib/cached-queries'

import { ParticipantRolesTable } from './components/ParticipantRolesTable'
import { ParticipantRolesTableSkeleton } from './components/ParticipantRolesTableSkeleton'

async function ParticipantRolesData({ organizationIds }: { organizationIds: number[] }) {
  const roles = await getCachedParticipantRoles(organizationIds)
  return <ParticipantRolesTable roles={roles as any} />
}

export default async function DashboardParticipantRolesPage() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Participant Roles</h1>
          <p className="text-sm text-muted-foreground">
            Roles that define required fields for participant registration.
          </p>
        </header>

        <Suspense fallback={<ParticipantRolesTableSkeleton />}>
          <ParticipantRolesData organizationIds={organizationIds} />
        </Suspense>
      </div>
    </div>
  )
}
