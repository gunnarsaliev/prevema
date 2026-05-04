import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'

import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashEvent } from '../../data'
import { getTwDashParticipants } from '../../../participants/data'
import ParticipantsGrid from './participants-grid'
import { ParticipantsListSkeleton } from '../../../participants/ParticipantsListSkeleton'

export const metadata: Metadata = { title: 'Participants' }

async function ParticipantsData({
  userId,
  organizationIds,
  eventId,
}: {
  userId: number
  organizationIds: number[]
  eventId: string
}) {
  const participants = await getTwDashParticipants(userId, organizationIds, eventId)
  return <ParticipantsGrid participants={participants} eventId={eventId} />
}

export default async function EventParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  if (organizationIds.length === 0) notFound()

  const rawEvent = await getTwDashEvent(id, userId)
  if (!rawEvent) notFound()
  const eventName = rawEvent.name

  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: eventName, href: `/tw/dash/events/${id}` },
          { label: 'Participants' },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Participants</Heading>
        </div>
        <Button href={`/tw/dash/participants/create?eventId=${id}`}>Create participant</Button>
      </div>
      <Suspense fallback={<ParticipantsListSkeleton />}>
        <ParticipantsData userId={userId} organizationIds={organizationIds} eventId={id} />
      </Suspense>
    </>
  )
}
