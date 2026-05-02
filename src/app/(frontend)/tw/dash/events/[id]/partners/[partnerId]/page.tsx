import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'

import { getTwDashPartner } from '../../../../partners/data'
import { PartnerDetail } from '../../../../partners/_components/PartnerDetail'
import { PartnerDetailSkeleton } from '../../../../partners/[id]/PartnerDetailSkeleton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; partnerId: string }>
}): Promise<Metadata> {
  const { partnerId } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const partner = await getTwDashPartner(partnerId, userId)
  return { title: partner?.companyName }
}

export default async function EventPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string; partnerId: string }>
}) {
  const { id, partnerId } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  if (organizationIds.length === 0) notFound()

  return (
    <Suspense fallback={<PartnerDetailSkeleton />}>
      <PartnerDetail
        partnerId={partnerId}
        userId={userId}
        backHref={`/tw/dash/events/${id}/partners`}
        backLabel="Partners"
      />
    </Suspense>
  )
}
