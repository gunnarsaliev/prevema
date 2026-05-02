import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'

import { getTwDashParticipant } from '../../../../participants/data'
import { ParticipantDetail } from '../../../../participants/_components/ParticipantDetail'
import { ParticipantDetailSkeleton } from '../../../../participants/[id]/ParticipantDetailSkeleton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; participantId: string }>
}): Promise<Metadata> {
  const { participantId } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const participant = await getTwDashParticipant(participantId, userId)
  return { title: participant?.name }
}

export default async function EventParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string; participantId: string }>
}) {
  const { id, participantId } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  if (organizationIds.length === 0) notFound()

  return (
    <Suspense fallback={<ParticipantDetailSkeleton />}>
      <ParticipantDetail
        participantId={participantId}
        userId={userId}
        backHref={`/tw/dash/events/${id}/participants`}
        backLabel="Participants"
      />
    </Suspense>
  )
}
