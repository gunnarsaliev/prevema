import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Participant } from '@/payload-types'
import { orgParticipantsTag } from '@/lib/cached-queries'

/**
 * Cached participants list scoped to the user's organizations.
 * Two-tier caching: react.cache() for request dedupe + unstable_cache() for persistence.
 * Tagged with orgParticipantsTag — invalidated automatically on participant mutations.
 */
export const getDashboardParticipants = cache(
  async (userId: number, organizationIds: number[], eventId?: string) => {
    const cacheKey = [
      ...organizationIds.slice().sort((a, b) => a - b),
      eventId ?? 'all',
    ].join(',')
    const tags = organizationIds.map(orgParticipantsTag)

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })

        const baseWhere =
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

        const where = eventId
          ? { and: [baseWhere, { event: { equals: Number(eventId) } }].filter(Boolean) }
          : baseWhere

        const { docs } = await payload.find({
          collection: 'participants',
          overrideAccess: true,
          where: where as any,
          depth: 1,
          limit: 500,
          sort: 'name',
        })

        return docs as Participant[]
      },
      ['dashboard-participants', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)
