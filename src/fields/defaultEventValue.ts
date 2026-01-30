import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Default value function for event fields
 * Automatically selects the event if there's exactly one event available for the user's organization(s)
 */
export const defaultEventValue = async ({ user, req }: any) => {
  if (!user) return undefined

  try {
    // Get user's organizations
    const organizationIds = await getUserOrganizationIds(req.payload, user)

    if (organizationIds.length === 0) {
      return undefined
    }

    // Query events for the user's organizations
    const events = await req.payload.find({
      collection: 'events',
      where: {
        organization: {
          in: organizationIds,
        },
      },
      limit: 2, // Only need to check if there's 1 or more
      depth: 0,
    })

    // If there's exactly one event, return it as default
    if (events.totalDocs === 1 && events.docs.length === 1) {
      return events.docs[0].id
    }
  } catch (error) {
    console.error('[defaultEventValue] Error getting event:', error)
  }

  return undefined
}
