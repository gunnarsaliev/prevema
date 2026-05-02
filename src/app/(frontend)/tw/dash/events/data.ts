import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { format } from 'date-fns'

import config from '@/payload.config'
import type { Event, Media } from '@/payload-types'
import { orgEventsTag } from '@/lib/cached-queries'

/**
 * Cached events list for the /tw/dash/events page.
 *
 * Two-tier caching (Next.js best practice):
 *   1. React `cache()` — request-level deduplication.
 *   2. `unstable_cache()` — cross-request persistence with tag-based revalidation.
 *
 * Reuses the existing `orgEventsTag` so mutations on the Events collection
 * (which already call `revalidateTag(orgEventsTag(orgId))` via afterChange/
 * afterDelete hooks) automatically invalidate this cache as well.
 */
export const getTwDashEvents = cache(async (userId: number, organizationIds: number[]) => {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgEventsTag)

  const cachedFetch = unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })

      const { docs } = await payload.find({
        collection: 'events',
        overrideAccess: true,
        where: organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined,
        depth: 1,
        limit: 200,
        sort: '-startDate',
      })

      return docs as Event[]
    },
    ['tw-dash-events-list', userId.toString(), cacheKey],
    {
      revalidate: 30,
      tags,
    },
  )

  return cachedFetch()
})

/**
 * Fetch a single event by ID with persistent caching.
 * Cache key includes userId to prevent cross-user leakage.
 */
export const getTwDashEvent = cache(async (eventId: string, userId: number) => {
  const cachedFetch = unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })

      try {
        const event = await payload.findByID({
          collection: 'events',
          id: eventId,
          overrideAccess: true,
          depth: 1,
        })
        return event as Event
      } catch {
        return null
      }
    },
    ['tw-dash-event', eventId, userId.toString()],
    {
      revalidate: 60,
      tags: [`event-${eventId}`, `tw-dash-event-${eventId}`],
    },
  )

  return cachedFetch()
})

/**
 * Shape expected by the Catalyst event templates.
 * Fields without a Payload counterpart (`time`, `ticketsSold`, `ticketsAvailable`)
 * are intentionally omitted.
 */
export interface CatalystEvent {
  id: string
  url: string
  name: string
  imgUrl: string
  date: string
  endDate?: string
  timezone?: string
  location: string
  eventType?: 'physical' | 'online'
  status: 'planning' | 'open' | 'closed' | 'archived'
  description?: string
  why?: string
  what?: string
  who?: string
  theme?: string
}

export function mapEventToCatalyst(event: Event): CatalystEvent {
  const image =
    event.image && typeof event.image === 'object' && 'url' in event.image
      ? ((event.image as Media).url ?? '')
      : ''

  const date = event.startDate ? format(new Date(event.startDate), 'PPP') : ''
  const location = event.where || event.address || ''

  const endDate = event.endDate ? format(new Date(event.endDate), 'PPP') : undefined

  return {
    id: String(event.id),
    url: `/tw/dash/events/${event.id}`,
    name: event.name,
    imgUrl: image,
    date,
    endDate,
    timezone: event.timezone ?? undefined,
    location,
    eventType: event.eventType ?? undefined,
    status: (event.status ?? 'planning') as CatalystEvent['status'],
    description: event.description ?? undefined,
    why: event.why ?? undefined,
    what: event.what ?? undefined,
    who: event.who ?? undefined,
    theme: event.theme ?? undefined,
  }
}
