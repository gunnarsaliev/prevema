import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Default value function for organization fields
 * Automatically selects the organization if the user has exactly one organization
 */
export const defaultOrganizationValue = async ({ user, req }: any) => {
  if (!user) return undefined

  try {
    const organizationIds = await getUserOrganizationIds(req.payload, user)

    // Return the user's first (current) organization as default
    if (organizationIds.length > 0) {
      return organizationIds[0]
    }
  } catch (error) {
    console.error('[defaultOrganizationValue] Error getting organization:', error)
  }

  return undefined
}
