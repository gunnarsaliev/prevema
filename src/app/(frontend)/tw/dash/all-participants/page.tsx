import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashParticipants } from '../participants/data'
import { getTwDashEvents } from '../events/data'
import { ParticipantsTable } from './ParticipantsTable'
import type { Metadata } from 'next'
import PageHeader from '../components/page-header'

export const metadata: Metadata = {
  title: 'All Participants',
}

export default async function AllParticipantsPage({
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

  const [participants, events] = await Promise.all([
    getTwDashParticipants(userId, organizationIds, eventId),
    getTwDashEvents(userId, organizationIds),
  ])

  return (
    <>
      <PageHeader
        title="All Participants"
        primaryAction={{ label: 'Generate with Prevema', href: '/tw/dash/events' }}
        secondaryAction={{ label: '+ Add New', href: '/tw/dash/participants/create' }}
      />
      <div className="mt-8">
        <ParticipantsTable
          participants={participants}
          events={events.map((e) => ({ id: String(e.id), name: e.name }))}
          selectedEventId={eventId}
        />
      </div>
    </>
  )
}
