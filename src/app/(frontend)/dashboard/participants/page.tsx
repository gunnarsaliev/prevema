import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getCachedLayoutData, getCachedUserOrgIds } from '@/lib/cached-queries'

import { getDashboardParticipants } from './data'
import { ParticipantsTable } from './components/ParticipantsTable'
import { ParticipantsTableSkeleton } from './components/ParticipantsTableSkeleton'

interface ParticipantsDataProps {
  userId: number
  organizationIds: number[]
  canEdit: boolean
  eventId?: string
}

async function ParticipantsData({
  userId,
  organizationIds,
  canEdit,
  eventId,
}: ParticipantsDataProps) {
  const participants = await getDashboardParticipants(userId, organizationIds, eventId)
  return <ParticipantsTable participants={participants} canEdit={canEdit} />
}

export default async function DashboardParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const { permissions } = await getCachedLayoutData(userId, organizationIds)

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Participants</h1>
          <p className="text-sm text-muted-foreground">
            All participants across your organizations.
          </p>
        </header>

        <Suspense fallback={<ParticipantsTableSkeleton />}>
          <ParticipantsData
            userId={userId}
            organizationIds={organizationIds}
            canEdit={permissions.canEdit}
            eventId={eventId}
          />
        </Suspense>
      </div>
    </div>
  )
}
