import type { Access, Where } from 'payload'
import { checkRole, isTeamOwner, getUserTeamIds } from './utilities'

/**
 * Access control that allows:
 * - Super-admins: Full access
 * - Team owners: Access to their team's documents
 * - Regular users: No access
 */
export const teamOwnerAccess: Access = async ({ req: { user, payload } }) => {
  if (!user) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // Get all team IDs where user is an owner
  const adminTeamIds = await getUserTeamIds(payload, user, 'owner')

  if (adminTeamIds.length === 0) {
    return false
  }

  // Return query constraint for team field
  return {
    team: {
      in: adminTeamIds,
    },
  }
}

/**
 * Access control that allows:
 * - Super-admins: Full access
 * - Team members (owner or editor): Access to their team's documents
 */
export const teamEditorAccess: Access = async ({ req: { user, payload } }) => {
  if (!user) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // Get all team IDs where user is an editor (includes owners)
  const memberTeamIds = await getUserTeamIds(payload, user)

  if (memberTeamIds.length === 0) {
    return false
  }

  // Return query constraint for team field
  return {
    team: {
      in: memberTeamIds,
    },
  }
}

/**
 * Field-level access that checks if user is owner of a specific team
 * Use this for fields that should only be editable by team owners
 */
export const teamOwnerFieldAccess = async ({ req: { user, payload }, data }: any) => {
  if (!user) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // Get the team ID from the document
  const teamId = typeof data?.team === 'object' ? data.team?.id : data?.team

  if (!teamId) return false

  // Check if user is owner of this team
  return isTeamOwner(payload, user, teamId)
}

/**
 * Create access control for a specific team
 * Useful for checking permissions in hooks
 */
export const canAccessTeam = async (payload: any, user: any, teamId: string, requiredRole?: 'owner' | 'editor'): Promise<boolean> => {
  if (!user || !teamId) return false

  // Super-admins can access everything
  if (checkRole(['super-admin'], user)) {
    return true
  }

  // If no specific role required, check if user is an editor
  if (!requiredRole) {
    const memberTeamIds = await getUserTeamIds(payload, user)
    return memberTeamIds.includes(teamId)
  }

  // Check specific role
  if (requiredRole === 'owner') {
    return isTeamOwner(payload, user, teamId)
  }

  // For editor role, check if user has any role in the team
  const memberTeamIds = await getUserTeamIds(payload, user)
  return memberTeamIds.includes(teamId)
}
