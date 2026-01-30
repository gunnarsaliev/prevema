import type { FieldAccess } from 'payload'

import { checkRole, getOrganizationRole } from '@/access/utilities'

/**
 * Field access control for organization owner operations:
 * - Super-admins and admins can always access
 * - Only organization owners can update this field
 * - Editors and viewers cannot update
 */
export const organizationOwnerFieldAccess: FieldAccess = async ({
  req: { user, payload },
  data,
}) => {
  if (!user) return false

  // Super-admins and admins can access everything
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Get the organization ID from the document being edited
  const organizationId = data?.id || null

  if (!organizationId) {
    // For new documents, allow access (will be checked at collection level)
    return true
  }

  // Check if user is owner of this organization
  const userRole = await getOrganizationRole(payload, user, organizationId)

  return userRole === 'owner'
}
