import type { FieldAccess } from 'payload'

import { checkRole, getTeamRole } from '@/access/utilities'

/**
 * Field access control for team owner operations:
 * - Super-admins and admins can always access
 * - Only team owners can update this field
 * - Editors and viewers cannot update
 */
export const teamOwnerFieldAccess: FieldAccess = async ({ req: { user, payload }, data }) => {
  if (!user) return false

  // Super-admins and admins can access everything
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Get the team ID from the document being edited
  const teamId = data?.id || null

  if (!teamId) {
    // For new documents, allow access (will be checked at collection level)
    return true
  }

  // Check if user is owner of this team
  const userRole = await getTeamRole(payload, user, teamId)

  return userRole === 'owner'
}
