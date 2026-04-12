import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event } from '@/payload-types'

/**
 * Cache tag helpers — call these from server actions after mutations.
 */
export function orgCountsTag(organizationId: number | string) {
  return `org-${organizationId}-counts`
}
export function orgEventsTag(organizationId: number | string) {
  return `org-${organizationId}-events`
}

/**
 * Cached dashboard counts scoped to the user's organizations.
 * Safe because cache key = org IDs; queries are org-filtered with overrideAccess: true.
 */
export function getCachedDashboardCounts(organizationIds: number[]) {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.flatMap((id) => [orgCountsTag(id), orgEventsTag(id)])

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })

      const orgFilter = { organization: { in: organizationIds } }

      const [
        eventsResult,
        participantsResult,
        partnersResult,
        emailTemplatesResult,
        imageTemplatesResult,
      ] = await Promise.all([
        payload.find({
          collection: 'events',
          overrideAccess: true,
          where: orgFilter,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'participants',
          overrideAccess: true,
          where: orgFilter,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'partners',
          overrideAccess: true,
          where: orgFilter,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'email-templates',
          overrideAccess: true,
          where: orgFilter,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'image-templates',
          overrideAccess: true,
          where: orgFilter,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
      ])

      return {
        events: eventsResult.totalDocs || 0,
        participants: participantsResult.totalDocs || 0,
        partners: partnersResult.totalDocs || 0,
        creatives: (emailTemplatesResult.totalDocs || 0) + (imageTemplatesResult.totalDocs || 0),
      }
    },
    [`dashboard-counts-${cacheKey}`],
    {
      revalidate: 60,
      tags,
    },
  )()
}

/**
 * Cached upcoming event scoped to the user's organizations.
 */
export function getCachedUpcomingEvent(organizationIds: number[]): Promise<Event | null> {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgEventsTag)

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { docs } = await payload.find({
        collection: 'events',
        overrideAccess: true,
        where: {
          and: [
            { startDate: { greater_than_equal: today.toISOString() } },
            { organization: { in: organizationIds } },
          ],
        },
        depth: 1,
        limit: 1,
        sort: 'startDate',
      })

      return docs.length > 0 ? (docs[0] as Event) : null
    },
    [`upcoming-event-${cacheKey}`],
    {
      revalidate: 60,
      tags,
    },
  )()
}
