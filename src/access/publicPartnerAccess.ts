import type { Access } from 'payload'
import { getUserOrganizationIds, getUserOrganizationIdsWithMinRole, checkRole } from './utilities'

// Allow public (unauthenticated) users to create partners
export const publicPartnerCreate: Access = async ({ req: { user, payload } }) => {
  // Allow public access (no authentication required)
  if (!user) {
    return true
  }

  // If user is authenticated, use same logic as organization-aware create
  // Super-admins and admins can create records in any organization
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can create records (viewers cannot)
  const organizationIds = await getUserOrganizationIdsWithMinRole(payload, user, 'editor')

  if (organizationIds.length > 0) {
    return {
      organization: {
        in: organizationIds,
      },
    }
  }

  return false
}

// Read access - organization aware for authenticated users only
export const publicPartnerRead: Access = async ({ req: { user, payload } }) => {
  // No public read access
  if (!user) {
    return false
  }

  // Super-admins and admins can read all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Non-admin users can only read records from their organizations
  const organizationIds = await getUserOrganizationIds(payload, user)

  if (organizationIds.length > 0) {
    return {
      organization: {
        in: organizationIds,
      },
    }
  }

  return false
}
