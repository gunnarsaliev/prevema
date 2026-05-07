import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashEvent } from '../data'
import { EventDetail } from '../_components/EventDetail'
import { EventDetailSkeleton } from './EventDetailSkeleton'
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
  const event = await getTwDashEvent(id, userId)
  return { title: event?.name }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  if (organizationIds.length === 0) notFound()

  const event = await getTwDashEvent(id, userId)
  const eventName = event?.name ?? id

  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/dash/events' },
          { label: eventName },
        ]}
      />
      <Suspense fallback={<EventDetailSkeleton />}>
        <EventDetail eventId={id} userId={userId} organizationIds={organizationIds} />
      </Suspense>
    </>
  )
}
