import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Partner } from '@/payload-types'
import { orgPartnersTag } from '@/lib/cached-queries'

/**
 * Cached partners list for the /tw/dash/partners page.
 * Two-tier caching: react.cache() for request dedupe + unstable_cache() for persistence.
 * Tagged with orgPartnersTag — invalidated automatically on partner mutations.
 */
export const getTwDashPartners = cache(
  async (userId: number, organizationIds: number[], eventId?: string) => {
    const cacheKey = [
      ...organizationIds.slice().sort((a, b) => a - b),
      eventId ?? 'all',
    ].join(',')
    const tags = organizationIds.map(orgPartnersTag)

    const cachedFetch = unstable_cache(
      async () => {
        const payload = await getPayload({ config: await config })

        const baseWhere =
          organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

        const where = eventId
          ? { and: [baseWhere, { event: { equals: Number(eventId) } }].filter(Boolean) }
          : baseWhere

        const { docs } = await payload.find({
          collection: 'partners',
          overrideAccess: true,
          where: where as any,
          depth: 1,
          limit: 500,
          sort: 'companyName',
        })

        return docs as Partner[]
      },
      ['tw-dash-partners', userId.toString(), cacheKey],
      { revalidate: 30, tags },
    )

    return cachedFetch()
  },
)

/**
 * Fetch a single partner by ID with persistent caching.
 */
export const getTwDashPartner = cache(async (partnerId: string, userId: number) => {
  const cachedFetch = unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      try {
        return await payload.findByID({
          collection: 'partners',
          id: partnerId,
          overrideAccess: true,
          depth: 1,
        })
      } catch {
        return null
      }
    },
    ['tw-dash-partner', partnerId, userId.toString()],
    {
      revalidate: 60,
      tags: [`partner-${partnerId}`, `tw-dash-partner-${partnerId}`],
    },
  )
  return cachedFetch()
})
