import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import type { Media } from '@/payload-types'
import {
  DashboardHeader,
  EmailHistoryWidget,
  RegistrationsChart,
  RecentArrivalsWidget,
  RecentPartnersWidget,
  SchedulePanel,
  StatsCards,
} from '@/components/dashboard'
import {
  buildDashboardStats,
  getDashboardSummary,
  getRecentEmailLogs,
  getRecentParticipants,
  getRecentPartners,
  getRegistrationTimeline,
  getUpcomingEventsAsBookings,
} from './data'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from, to } = await searchParams

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  const fullUser = user
    ? await payload.findByID({ collection: 'users', id: user.id, depth: 1 })
    : null
  const profileImage = fullUser?.profileImage
  const avatarUrl =
    profileImage && typeof profileImage === 'object'
      ? ((profileImage as Media).thumbnailURL ?? (profileImage as Media).url ?? undefined)
      : undefined

  const rawOrgIds = user ? await getUserOrganizationIds(payload, user) : []
  const organizationIds = rawOrgIds.map(Number).filter((n) => !isNaN(n))

  const userId = user?.id ?? 0

  const [
    summary,
    recentParticipants,
    recentPartners,
    upcomingBookings,
    registrationTimeline,
    recentEmailLogs,
  ] = await Promise.all([
    getDashboardSummary(userId, organizationIds),
    getRecentParticipants(userId, organizationIds),
    getRecentPartners(userId, organizationIds),
    getUpcomingEventsAsBookings(userId, organizationIds),
    getRegistrationTimeline(userId, organizationIds, 30, from, to),
    getRecentEmailLogs(userId, organizationIds),
  ])

  const stats = buildDashboardStats(summary)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader
        name={user?.name ?? 'there'}
        email={user?.email}
        avatarUrl={avatarUrl}
        from={from}
        to={to}
      />

      <div className="px-4 sm:px-6">
        <StatsCards stats={stats} />
      </div>

      <div className="grid gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:items-stretch">
        <div className="flex flex-col gap-6">
          <RegistrationsChart data={registrationTimeline} />
        </div>

        <div className="flex flex-col rounded-xl border bg-card">
          <SchedulePanel
            bookings={upcomingBookings}
            title="Upcoming Events"
            viewAllHref="/dash/events"
          />
        </div>
      </div>

      <div className="grid gap-6 px-4 sm:px-6 lg:grid-cols-2">
        <RecentArrivalsWidget
          items={recentParticipants}
          title="Recent Participants"
          viewAllHref="/dash/participants"
        />
        <RecentPartnersWidget
          items={recentPartners}
          title="Recent Partners"
          viewAllHref="/dash/partners"
        />
      </div>

      <div className="px-4 sm:px-6">
        <EmailHistoryWidget
          items={recentEmailLogs}
          title="Email History"
          viewAllHref="/dash/email-logs"
        />
      </div>
    </div>
  )
}
