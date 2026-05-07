import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { formatDistanceToNow } from 'date-fns'

import config from '@/payload.config'
import type { EmailLog, Event, Media, Participant, Partner } from '@/payload-types'
import { orgEventsTag, orgParticipantsTag, orgPartnersTag } from '@/lib/cached-queries'
import { compileTemplate } from '@/utils/templateEngine'
import type {
  Booking,
  EmailLogItem,
  RecentArrivalItem,
  RecentPartnerItem,
  RegistrationDayData,
  StatItem,
} from '@/components/dashboard'

const STATUS_COLOR_MAP: Record<string, string> = {
  open: 'emerald',
  planning: 'amber',
  closed: 'sky',
  archived: 'violet',
}

/**
 * Summary counts for Events, Participants, Partners — used in stats cards.
 */
export const getDashboardSummary = cache(async (userId: number, organizationIds: number[]) => {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.flatMap((id) => [
    orgEventsTag(id),
    orgParticipantsTag(id),
    orgPartnersTag(id),
  ])

  const cachedFetch = unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const where =
        organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

      const [{ totalDocs: events }, { totalDocs: participants }, { totalDocs: partners }] =
        await Promise.all([
          payload.find({ collection: 'events', where, limit: 0, overrideAccess: true }),
          payload.find({ collection: 'participants', where, limit: 0, overrideAccess: true }),
          payload.find({ collection: 'partners', where, limit: 0, overrideAccess: true }),
        ])

      return { events, participants, partners }
    },
    ['tw-dash-summary', userId.toString(), cacheKey],
    { revalidate: 30, tags },
  )

  return cachedFetch()
})

/**
 * Last N registered participants — shown in RecentArrivalsWidget.
 */
export const getRecentParticipants = cache(
  async (userId: number, organizationIds: number[], limit = 6): Promise<RecentArrivalItem[]> => {
    const cacheKey =
      organizationIds
        .slice()
        .sort((a, b) => a - b)
        .join(',') + `-${limit}`
    const tags = organizationIds.map(orgParticipantsTag)

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })
        const where =
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

        const { docs } = await payload.find({
          collection: 'participants',
          overrideAccess: true,
          where,
          depth: 1,
          limit,
          sort: '-createdAt',
        })

        return (docs as Participant[]).map((p): RecentArrivalItem => {
          const avatarMedia =
            p.imageUrl && typeof p.imageUrl === 'object' ? (p.imageUrl as Media) : null
          const avatarUrl = avatarMedia?.url ?? undefined
          const eventName =
            p.event && typeof p.event === 'object' ? (p.event as Event).name : undefined

          const regDate =
            p.registrationDate ??
            ((p as unknown as Record<string, unknown>).createdAt as string | undefined)

          return {
            id: p.id,
            name: p.name,
            time: regDate ? formatDistanceToNow(new Date(regDate), { addSuffix: true }) : '—',
            initials: p.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            avatar: avatarUrl,
            subtitle: eventName,
            href: `/tw/dash/participants/${p.id}`,
          }
        })
      },
      ['tw-dash-recent-participants', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)

/**
 * Last N registered partners — shown in RecentPartnersWidget.
 */
export const getRecentPartners = cache(
  async (userId: number, organizationIds: number[], limit = 6): Promise<RecentPartnerItem[]> => {
    const cacheKey =
      organizationIds
        .slice()
        .sort((a, b) => a - b)
        .join(',') + `-${limit}`
    const tags = organizationIds.map(orgPartnersTag)

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })
        const where =
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

        const { docs } = await payload.find({
          collection: 'partners',
          overrideAccess: true,
          where,
          depth: 1,
          limit,
          sort: '-createdAt',
        })

        return (docs as Partner[]).map((p): RecentPartnerItem => {
          const logoMedia =
            p.companyLogo && typeof p.companyLogo === 'object' ? (p.companyLogo as Media) : null
          const logoUrl = logoMedia?.thumbnailURL ?? logoMedia?.url ?? p.companyLogoUrl ?? undefined
          const eventName =
            p.event && typeof p.event === 'object' ? (p.event as Event).name : undefined

          const regDate =
            p.registrationDate ??
            p.createdDate ??
            ((p as unknown as Record<string, unknown>).createdAt as string | undefined)

          return {
            id: p.id,
            companyName: p.companyName,
            time: regDate ? formatDistanceToNow(new Date(regDate), { addSuffix: true }) : '—',
            initials: p.companyName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            logoUrl,
            eventName,
            href: `/tw/dash/partners/${p.id}`,
          }
        })
      },
      ['tw-dash-recent-partners', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)

/**
 * Upcoming events shaped as Booking[] for the SchedulePanel.
 */
export const getUpcomingEventsAsBookings = cache(
  async (userId: number, organizationIds: number[], limit = 8): Promise<Booking[]> => {
    const cacheKey =
      organizationIds
        .slice()
        .sort((a, b) => a - b)
        .join(',') + `-${limit}`
    const tags = organizationIds.map(orgEventsTag)

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })
        const now = new Date().toISOString()

        const orgWhere =
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

        const where = orgWhere
          ? { and: [orgWhere, { startDate: { greater_than_equal: now } }] }
          : { startDate: { greater_than_equal: now } }

        const { docs } = await payload.find({
          collection: 'events',
          overrideAccess: true,
          where: where as any,
          depth: 0,
          limit,
          sort: 'startDate',
        })

        return (docs as Event[]).map((ev): Booking => {
          const startDate = ev.startDate ? new Date(ev.startDate) : null
          const endDate = ev.endDate ? new Date(ev.endDate) : null
          const nights =
            startDate && endDate
              ? Math.max(
                  0,
                  Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
                )
              : 0

          const timeStr = startDate
            ? startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'

          return {
            id: String(ev.id),
            guestName: ev.name,
            roomNumber: '',
            roomType: ev.eventType ?? '',
            time: timeStr,
            guests: [],
            guestCount: 0,
            source: 'Direct',
            status: ev.status ?? 'planning',
            statusColor: STATUS_COLOR_MAP[ev.status ?? 'planning'] ?? 'amber',
            nights,
            specialRequests: ev.description ?? undefined,
            href: `/tw/dash/events/${ev.id}`,
          }
        })
      },
      ['tw-dash-upcoming-events', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)

/**
 * Registration timeline — counts of participants & partners registered per day
 * over the last `days` days. Used by the registrations chart.
 */
export const getRegistrationTimeline = cache(
  async (
    userId: number,
    organizationIds: number[],
    days = 30,
    fromDate?: string,
    toDate?: string,
  ): Promise<RegistrationDayData[]> => {
    const cacheKey =
      organizationIds
        .slice()
        .sort((a, b) => a - b)
        .join(',') + `-${fromDate ?? days}-${toDate ?? ''}`
    const tags = organizationIds.flatMap((id) => [orgParticipantsTag(id), orgPartnersTag(id)])

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })
        const now = new Date()
        now.setHours(23, 59, 59, 999)

        const until = toDate ? new Date(toDate) : new Date(now)
        until.setHours(23, 59, 59, 999)

        const since = fromDate ? new Date(fromDate) : new Date()
        if (!fromDate) {
          since.setDate(since.getDate() - days + 1)
        }
        since.setHours(0, 0, 0, 0)

        const actualDays =
          Math.round((until.getTime() - since.getTime()) / (1000 * 60 * 60 * 24)) + 1

        const sinceIso = since.toISOString()

        const orgWhere =
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

        const untilIso = until.toISOString()
        const makeWhere = (dateField: string) => {
          const dateCond = {
            and: [
              { [dateField]: { greater_than_equal: sinceIso } },
              { [dateField]: { less_than_equal: untilIso } },
            ],
          }
          return orgWhere ? { and: [orgWhere, dateCond] } : dateCond
        }

        const [{ docs: pDocs }, { docs: ptDocs }] = await Promise.all([
          payload.find({
            collection: 'participants',
            overrideAccess: true,
            where: makeWhere('createdAt') as any,
            limit: 2000,
            depth: 0,
            select: { createdAt: true, registrationDate: true } as any,
          }),
          payload.find({
            collection: 'partners',
            overrideAccess: true,
            where: makeWhere('createdAt') as any,
            limit: 2000,
            depth: 0,
            select: { createdAt: true, registrationDate: true } as any,
          }),
        ])

        const toDateKey = (doc: Record<string, unknown>): string => {
          const raw = (doc.registrationDate as string | null) ?? (doc.createdAt as string)
          return new Date(raw).toISOString().slice(0, 10)
        }

        const buckets: Record<string, RegistrationDayData> = {}
        const addDay = (dateKey: string) => {
          if (!buckets[dateKey]) {
            buckets[dateKey] = { date: dateKey, participants: 0, partners: 0 }
          }
        }

        // Pre-fill every day in range so gaps show as 0
        for (let i = 0; i < actualDays; i++) {
          const d = new Date(since)
          d.setDate(d.getDate() + i)
          addDay(d.toISOString().slice(0, 10))
        }

        for (const doc of pDocs) {
          const key = toDateKey(doc as unknown as Record<string, unknown>)
          if (buckets[key]) buckets[key].participants += 1
        }
        for (const doc of ptDocs) {
          const key = toDateKey(doc as unknown as Record<string, unknown>)
          if (buckets[key]) buckets[key].partners += 1
        }

        return Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date))
      },
      ['tw-dash-registration-timeline', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)

/**
 * Last N outbound emails sent to participants/partners in the org.
 * Used by the email history widget on the dashboard.
 */
export const getRecentEmailLogs = cache(
  async (userId: number, organizationIds: number[], limit = 8): Promise<EmailLogItem[]> => {
    const cacheKey =
      organizationIds
        .slice()
        .sort((a, b) => a - b)
        .join(',') + `-${limit}`
    const tags = organizationIds.map((id) => `org-${id}-email-logs`)

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })
        const where =
          organizationIds.length > 0
            ? {
                and: [
                  { organization: { in: organizationIds } },
                  { direction: { equals: 'outbound' } },
                ],
              }
            : { direction: { equals: 'outbound' } }

        const { docs } = await payload.find({
          collection: 'email-logs',
          overrideAccess: true,
          where: where as any,
          depth: 0,
          limit,
          sort: '-sentAt',
        })

        return (docs as EmailLog[]).map((log): EmailLogItem => {
          const dateStr =
            log.sentAt ??
            ((log as unknown as Record<string, unknown>).createdAt as string | undefined)

          let vars: Record<string, string> = {}
          if (log.variables) {
            try {
              vars = JSON.parse(log.variables)
            } catch {
              /* ignore */
            }
          }
          const resolvedSubject = compileTemplate(log.subject, vars)
            .replace(/\{\{\w+\}\}/g, '')
            .trim()

          return {
            id: log.id,
            subject: resolvedSubject || log.subject,
            toEmail: log.toEmail,
            toName: log.toName ?? undefined,
            fromName: log.fromName ?? undefined,
            templateName: log.templateName ?? undefined,
            triggerEvent: log.triggerEvent ?? null,
            status: log.status,
            sentAt: log.sentAt ?? null,
            time: dateStr ? formatDistanceToNow(new Date(dateStr), { addSuffix: true }) : '—',
          }
        })
      },
      ['tw-dash-recent-email-logs', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)

/**
 * Build the three stat cards from summary counts.
 */
export function buildDashboardStats(summary: {
  events: number
  participants: number
  partners: number
}): StatItem[] {
  return [
    {
      title: 'Events',
      value: summary.events,
      format: 'number',
      footerLabel: 'Total events in your organizations',
    },
    {
      title: 'Participants',
      value: summary.participants,
      format: 'number',
      footerLabel: 'Registered across all events',
    },
    {
      title: 'Partners',
      value: summary.partners,
      format: 'number',
      footerLabel: 'Across all events',
    },
  ]
}
