import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashParticipant } from '../data'
import { ParticipantDetail } from '../_components/ParticipantDetail'
import { ParticipantDetailSkeleton } from './ParticipantDetailSkeleton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const participant = await getTwDashParticipant(id, userId)
  return { title: participant?.name }
}

export default async function ParticipantDetailPage({
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

  const participant = await getTwDashParticipant(id, userId)
  const participantName = participant?.name ?? id

  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Participants', href: '/tw/dash/participants' },
          { label: participantName },
        ]}
      />
      <Suspense fallback={<ParticipantDetailSkeleton />}>
        <ParticipantDetail participantId={id} userId={userId} />
      </Suspense>
    </>
  )
}
