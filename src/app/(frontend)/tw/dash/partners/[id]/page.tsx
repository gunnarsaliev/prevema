import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import type { Metadata } from 'next'

import { getTwDashPartner } from '../data'
import { PartnerDetail } from '../_components/PartnerDetail'
import { PartnerDetailSkeleton } from './PartnerDetailSkeleton'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'

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
  const partner = await getTwDashPartner(id, userId)
  return { title: partner?.companyName }
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  if (organizationIds.length === 0) notFound()

  const partner = await getTwDashPartner(id, userId)
  const partnerName = partner?.companyName ?? id

  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Partners', href: '/tw/dash/partners' },
          { label: partnerName },
        ]}
      />
      <Suspense fallback={<PartnerDetailSkeleton />}>
        <PartnerDetail
          partnerId={id}
          userId={userId}
        />
      </Suspense>
    </>
  )
}
