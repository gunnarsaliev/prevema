import { Suspense } from 'react'
import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashParticipants } from './data'
import { ParticipantsList } from './ParticipantsList'
import { ParticipantsListSkeleton } from './ParticipantsListSkeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Participants',
}

async function ParticipantsData({
  userId,
  organizationIds,
  eventId,
}: {
  userId: number
  organizationIds: number[]
  eventId?: string
}) {
  const participants = await getTwDashParticipants(userId, organizationIds, eventId)
  return <ParticipantsList participants={participants} />
}

export default async function ParticipantsPage({
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

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Participants</Heading>
        </div>
        <Button href={eventId ? `/tw/dash/participants/create?eventId=${eventId}` : '/tw/dash/participants/create'}>
          Create participant
        </Button>
      </div>
      <Suspense fallback={<ParticipantsListSkeleton />}>
        <ParticipantsData userId={userId} organizationIds={organizationIds} eventId={eventId} />
      </Suspense>
    </>
  )
}
