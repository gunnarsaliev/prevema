import type { CollectionBeforeValidateHook } from 'payload'
import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Automatically selects the organization when:
 * - A new record is being created
 * - No organization has been manually selected yet
 * - The user has exactly one organization available
 */
export const autoSelectOrganization: CollectionBeforeValidateHook = async ({
  req,
  data,
  operation,
}) => {
  if (operation === 'create' && !data?.organization && req.user && data) {
    try {
      // Get user's organizations
      const organizationIds = await getUserOrganizationIds(req.payload, req.user)

      // If user has exactly one organization, auto-populate it
      if (organizationIds.length === 1) {
        data.organization = organizationIds[0]
      }
    } catch (error) {
      console.error('[autoSelectOrganization] Error auto-selecting organization:', error)
    }
  }

  return data
}
