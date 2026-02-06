import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Validates that an event ID belongs to one of the user's accessible organizations
 * Returns true if the event exists and user has access, false otherwise
 */
export async function validateEventAccess(
  payload: Payload,
  user: User,
  eventId: string,
): Promise<boolean> {
  try {
    // Get user's accessible organization IDs
    const organizationIds = await getUserOrganizationIds(payload, user)

    if (organizationIds.length === 0) {
      return false
    }

    // Query the event with organization filter
    const result = await payload.find({
      collection: 'events',
      where: {
        and: [
          {
            id: {
              equals: eventId,
            },
          },
          {
            organization: {
              in: organizationIds,
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
    })

    // Event exists and belongs to user's organizations
    return result.totalDocs > 0
  } catch (error) {
    console.error('[validateEventAccess] Error:', error)
    return false
  }
}
