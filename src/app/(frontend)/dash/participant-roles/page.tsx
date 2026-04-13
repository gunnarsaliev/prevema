import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { getCachedParticipantRoles } from '@/lib/cached-queries'
import { ParticipantRolesList } from './components/ParticipantRolesList'
import { ParticipantRolesListSkeleton } from './components/ParticipantRolesListSkeleton'

async function ParticipantRolesData({ organizationIds }: { organizationIds: number[] }) {
  const participantRoles = await getCachedParticipantRoles(organizationIds)

  return <ParticipantRolesList participantRoles={participantRoles as any} />
}

export default async function ParticipantRolesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <Suspense fallback={<ParticipantRolesListSkeleton />}>
        <ParticipantRolesData organizationIds={organizationIds} />
      </Suspense>
    </div>
  )
}
