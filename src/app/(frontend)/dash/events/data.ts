import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event } from '@/payload-types'
import { orgEventsTag } from '@/lib/cached-queries'

/**
 * Data access layer for events with optimized caching.
 *
 * Following Next.js best practices:
 * - React cache() for request-level deduplication
 * - unstable_cache() for persistent cross-request caching
 * - Proper cache key scoping with user and organization IDs
 * - Tag-based cache invalidation
 */

/**
 * Get events for a user's organizations.
 *
 * This function uses React cache() to deduplicate requests within a single
 * render pass. If called multiple times in the same request (e.g., in metadata
 * generation and page rendering), the database query only executes once.
 */
export const getEvents = cache(async (userId: number, organizationIds: number[]) => {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgEventsTag)

  // Use unstable_cache for persistent caching across requests
  const cachedFetch = unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })

      const { docs } = await payload.find({
        collection: 'events',
        overrideAccess: true,
        where: organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined,
        depth: 1,
        limit: 200,
        sort: '-createdAt',
      })

      return docs as Event[]
    },
    ['events-list', userId.toString(), cacheKey], // Cache key array
    {
      revalidate: 30, // Auto-revalidate after 30 seconds
      tags, // Tag for on-demand revalidation via revalidateTag()
    },
  )

  return cachedFetch()
})

/**
 * Get a single event by ID.
 *
 * Uses React cache() for deduplication within a request.
 * Useful for metadata generation and page rendering.
 */
export const getEvent = cache(async (eventId: string, userId: number) => {
  const cachedFetch = unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })

      const event = await payload.findByID({
        collection: 'events',
        id: eventId,
        overrideAccess: true,
        depth: 1,
      })

      return event as Event
    },
    ['event', eventId, userId.toString()], // Cache key includes event ID and user ID
    {
      revalidate: 60, // Revalidate every 60 seconds
      tags: [`event-${eventId}`], // Tag for specific event invalidation
    },
  )

  return cachedFetch()
})
