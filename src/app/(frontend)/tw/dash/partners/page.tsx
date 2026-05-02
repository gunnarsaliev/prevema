import { Suspense } from 'react'
import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashPartners } from './data'
import { PartnersList } from './PartnersList'
import { PartnersListSkeleton } from './PartnersListSkeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partners',
}

async function PartnersData({
  userId,
  organizationIds,
  eventId,
}: {
  userId: number
  organizationIds: number[]
  eventId?: string
}) {
  const partners = await getTwDashPartners(userId, organizationIds, eventId)
  return <PartnersList partners={partners} />
}

export default async function PartnersPage({
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
          <Heading>Partners</Heading>
        </div>
        <Button href={eventId ? `/tw/dash/partners/create?eventId=${eventId}` : '/tw/dash/partners/create'}>
          Create partner
        </Button>
      </div>
      <Suspense fallback={<PartnersListSkeleton />}>
        <PartnersData userId={userId} organizationIds={organizationIds} eventId={eventId} />
      </Suspense>
    </>
  )
}
