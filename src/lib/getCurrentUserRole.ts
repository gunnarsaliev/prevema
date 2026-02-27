import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { getOrganizationRole } from '@/access/utilities'

/**
 * Server-side utility to get the current user's role in the selected organization
 * This should ONLY be called from server components/actions
 *
 * @param payload - Payload instance
 * @param user - Authenticated user
 * @param organizationId - The organization ID to check role for
 * @returns Object with role and permission flags
 */
export async function getCurrentUserRole(
  payload: Payload,
  user: User | null,
  organizationId?: number | string | null
) {
  if (!user) {
    return {
      role: null,
      canEdit: false,
      canAdmin: false,
      isOwner: false,
    }
  }

  // If no organization specified, return default (no permissions)
  if (!organizationId) {
    return {
      role: null,
      canEdit: false,
      canAdmin: false,
      isOwner: false,
    }
  }

  // Fetch the user's role in this organization
  const role = await getOrganizationRole(payload, user, organizationId)

  // Define permissions based on role hierarchy
  // owner > admin > editor > viewer
  const roleHierarchy: Record<string, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  }

  const roleLevel = role ? roleHierarchy[role] || 0 : 0

  return {
    role,
    canEdit: roleLevel >= roleHierarchy.editor, // editor, admin, owner can edit
    canAdmin: roleLevel >= roleHierarchy.admin, // admin, owner can manage
    isOwner: role === 'owner',
  }
}
