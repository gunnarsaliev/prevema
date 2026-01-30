import type { Access, Where } from 'payload'
import { checkRole, isOrganizationOwner, getUserOrganizationIds } from './utilities'

/**
 * Access control that allows:
 * - Super-admins: Full access
 * - Organization owners: Access to their organization's documents
 * - Regular users: No access
 */
export const organizationOwnerAccess: Access = async ({ req: { user, payload } }) => {
  if (!user) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // Get all organization IDs where user is an owner
  const adminOrganizationIds = await getUserOrganizationIds(payload, user, 'owner')

  if (adminOrganizationIds.length === 0) {
    return false
  }

  // Return query constraint for organization field
  return {
    organization: {
      in: adminOrganizationIds,
    },
  }
}

/**
 * Access control that allows:
 * - Super-admins: Full access
 * - Organization members (owner or editor): Access to their organization's documents
 */
export const organizationEditorAccess: Access = async ({ req: { user, payload } }) => {
  if (!user) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // Get all organization IDs where user is an editor (includes owners)
  const memberOrganizationIds = await getUserOrganizationIds(payload, user)

  if (memberOrganizationIds.length === 0) {
    return false
  }

  // Return query constraint for organization field
  return {
    organization: {
      in: memberOrganizationIds,
    },
  }
}

/**
 * Field-level access that checks if user is owner of a specific organization
 * Use this for fields that should only be editable by organization owners
 */
export const organizationOwnerFieldAccess = async ({ req: { user, payload }, data }: any) => {
  if (!user) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // Get the organization ID from the document
  const organizationId =
    typeof data?.organization === 'object' ? data.organization?.id : data?.organization

  if (!organizationId) return false

  // Check if user is owner of this organization
  return isOrganizationOwner(payload, user, organizationId)
}

/**
 * Create access control for a specific organization
 * Useful for checking permissions in hooks
 */
export const canAccessOrganization = async (
  payload: any,
  user: any,
  organizationId: string,
  requiredRole?: 'owner' | 'editor',
): Promise<boolean> => {
  if (!user || !organizationId) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // If no specific role required, check if user is an editor
  if (!requiredRole) {
    const memberOrganizationIds = await getUserOrganizationIds(payload, user)
    return memberOrganizationIds.includes(organizationId)
  }

  // Check specific role
  if (requiredRole === 'owner') {
    return isOrganizationOwner(payload, user, organizationId)
  }

  // For editor role, check if user has any role in the organization
  const memberOrganizationIds = await getUserOrganizationIds(payload, user)
  return memberOrganizationIds.includes(organizationId)
}
