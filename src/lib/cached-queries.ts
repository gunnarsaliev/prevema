import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event, User } from '@/payload-types'
import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Cache tag helpers — call these from server actions after mutations.
 */
export function orgCountsTag(organizationId: number | string) {
  return `org-${organizationId}-counts`
}
export function orgEventsTag(organizationId: number | string) {
  return `org-${organizationId}-events`
}
export function orgLayoutTag(organizationId: number | string) {
  return `org-${organizationId}-layout`
}
export function orgTemplatesTag(organizationId: number | string) {
  return `org-${organizationId}-templates`
}
export function orgMediaTag(organizationId: number | string) {
  return `org-${organizationId}-media`
}
export function orgRolesTag(organizationId: number | string) {
  return `org-${organizationId}-roles`
}
export function orgPartnerTypesTag(organizationId: number | string) {
  return `org-${organizationId}-partner-types`
}
export function orgParticipantsTag(organizationId: number | string) {
  return `org-${organizationId}-participants`
}
export function orgPartnersTag(organizationId: number | string) {
  return `org-${organizationId}-partners`
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

/**
 * Cached layout data: events list + user role in first org.
 * Used by the dash layout to avoid a blocking DB round-trip on every navigation.
 */
export function getCachedLayoutData(userId: number, organizationIds: number[]) {
  const orgKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.flatMap((id) => [orgLayoutTag(id), orgEventsTag(id)])

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const firstOrgId = organizationIds[0] ?? null

      const [eventsResult, membershipResult] = await Promise.all([
        payload.find({
          collection: 'events',
          overrideAccess: true,
          where: organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined,
          depth: 0,
          limit: 100,
          sort: '-createdAt',
          select: { name: true },
        }),
        firstOrgId
          ? payload.find({
              collection: 'members',
              where: {
                and: [
                  { user: { equals: userId } },
                  { organization: { equals: firstOrgId } },
                  { status: { equals: 'active' } },
                ],
              },
              depth: 0,
              limit: 1,
            })
          : Promise.resolve({ docs: [] as any[] }),
      ])

      const events = eventsResult.docs.map((doc) => ({ id: String(doc.id), name: doc.name }))

      const rawRole = (membershipResult.docs[0]?.role as string | undefined) ?? null
      const validRoles = ['owner', 'admin', 'editor', 'viewer'] as const
      type OrgRole = (typeof validRoles)[number]
      const role: OrgRole | null =
        rawRole && (validRoles as readonly string[]).includes(rawRole) ? (rawRole as OrgRole) : null

      const roleHierarchy: Record<string, number> = { owner: 4, admin: 3, editor: 2, viewer: 1 }
      const roleLevel = role ? (roleHierarchy[role] ?? 0) : 0

      const permissions = {
        role,
        canEdit: roleLevel >= roleHierarchy.editor,
        canAdmin: roleLevel >= roleHierarchy.admin,
        isOwner: role === 'owner',
      }

      return { events, permissions }
    },
    [`layout-${userId}-${orgKey}`],
    { revalidate: 60, tags },
  )()
}

/**
 * Cached image templates scoped to the user's organizations.
 */
export function getCachedImageTemplates(organizationIds: number[]) {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgTemplatesTag)

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const { docs } = await payload.find({
        collection: 'image-templates',
        overrideAccess: true,
        where: organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined,
        depth: 1,
        limit: 500,
        sort: '-updatedAt',
      })
      return docs
    },
    [`image-templates-${cacheKey}`],
    { revalidate: 30, tags },
  )()
}

/**
 * Cached email templates scoped to the user's organizations.
 */
export function getCachedEmailTemplates(organizationIds: number[]) {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgTemplatesTag)

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const { docs } = await payload.find({
        collection: 'email-templates',
        overrideAccess: true,
        where: organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined,
        depth: 0,
        limit: 500,
        sort: '-updatedAt',
      })
      return docs
    },
    [`email-templates-${cacheKey}`],
    { revalidate: 30, tags },
  )()
}

/**
 * Cached media files scoped to the user's organizations (excluding template assets).
 */
export function getCachedMedia(organizationIds: number[]) {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgMediaTag)

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const { docs } = await payload.find({
        collection: 'media',
        overrideAccess: true,
        where:
          organizationIds.length > 0
            ? {
                and: [
                  { organization: { in: organizationIds } },
                  {
                    or: [
                      { isTemplateAsset: { equals: false } },
                      { isTemplateAsset: { exists: false } },
                    ],
                  },
                ],
              }
            : undefined,
        depth: 1,
        limit: 500,
        sort: '-updatedAt',
      })
      return docs
    },
    [`media-${cacheKey}`],
    { revalidate: 30, tags },
  )()
}

/**
 * Cached participant roles list scoped to the user's organizations.
 */
export function getCachedParticipantRoles(organizationIds: number[]) {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgRolesTag)

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const orgFilter =
        organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

      const { docs: participantRoles } = await payload.find({
        collection: 'participant-roles',
        overrideAccess: true,
        where: orgFilter,
        depth: 1,
        limit: 200,
        sort: 'name',
      })

      return participantRoles
    },
    [`participant-roles-${cacheKey}`],
    { revalidate: 60, tags },
  )()
}

/**
 * Cached partner types list scoped to the user's organizations.
 */
export function getCachedPartnerTypes(organizationIds: number[]) {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgPartnerTypesTag)

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const orgFilter =
        organizationIds.length > 0 ? { organization: { in: organizationIds } } : undefined

      const { docs: partnerTypes } = await payload.find({
        collection: 'partner-types',
        overrideAccess: true,
        where: orgFilter,
        depth: 1,
        limit: 200,
        sort: 'name',
      })

      return partnerTypes
    },
    [`partner-types-${cacheKey}`],
    { revalidate: 60, tags },
  )()
}

/**
 * Fetch events from database (base function).
 * This is the raw database query without any caching.
 */
async function fetchEventsFromDB(organizationIds: number[]) {
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
}

/**
 * Cached events list with full data for the events page.
 *
 * Uses two-tier caching strategy:
 * 1. React cache() - Deduplicates requests within a single render pass
 * 2. unstable_cache() - Caches across requests with time-based and tag-based revalidation
 *
 * Best practices from Next.js docs:
 * - Cache key includes userId and sorted org IDs for proper scoping
 * - Tags allow granular invalidation when events are created/updated
 * - 30-second revalidation keeps data fresh while reducing DB load
 */
export const getCachedEvents = cache(async (userId: number, organizationIds: number[]) => {
  const cacheKey = organizationIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')
  const tags = organizationIds.map(orgEventsTag)

  // unstable_cache for persistent cross-request caching
  const cachedFetch = unstable_cache(
    async () => fetchEventsFromDB(organizationIds),
    ['events-list', userId.toString(), cacheKey], // Explicit cache key array
    {
      revalidate: 30, // Revalidate every 30 seconds
      tags, // Enable tag-based invalidation
    },
  )

  return cachedFetch()
})

/**
 * Cached user org IDs.
 * Two-tier: React cache() deduplicates within a render pass;
 * unstable_cache persists across requests for 60 s.
 */
export const getCachedUserOrgIds = cache(async (userId: number): Promise<number[]> => {
  const cacheKey = String(userId)
  const tags = [`user-${userId}-orgs`]

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const ids = await getUserOrganizationIds(payload, { id: userId } as User)
      return ids.map(Number)
    },
    ['user-orgs', cacheKey],
    { revalidate: 60, tags },
  )()
})
