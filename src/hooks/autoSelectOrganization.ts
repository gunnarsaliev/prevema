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

      // Auto-populate with the user's first (current) organization
      if (organizationIds.length > 0) {
        data.organization = organizationIds[0]
      }
    } catch (error) {
      console.error('[autoSelectOrganization] Error auto-selecting organization:', error)
    }
  }

  return data
}
