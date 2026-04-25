import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Event } from '@/payload-types'
import { orgEventsTag } from '@/lib/cached-queries'

/**
 * Cached events list for the /dashboard/events page.
 *
 * Two-tier caching (Next.js best practice):
 *   1. React `cache()` — request-level deduplication.
 *   2. `unstable_cache()` — cross-request persistence with tag-based revalidation.
 *
 * Reuses the existing `orgEventsTag` so mutations on the Events collection
 * (which already call `revalidateTag(orgEventsTag(orgId))` via afterChange/
 * afterDelete hooks) automatically invalidate this cache as well.
 */
export const getDashboardEvents = cache(async (userId: number, organizationIds: number[]) => {
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
        where:
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined,
        depth: 1,
        limit: 200,
        sort: '-startDate',
      })

      return docs as Event[]
    },
    ['dashboard-events-list', userId.toString(), cacheKey],
    {
      revalidate: 30,
      tags,
    },
  )

  return cachedFetch()
})
