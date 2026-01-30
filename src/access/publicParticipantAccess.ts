import type { Access } from 'payload'
import { getUserTeamIds, getUserTeamIdsWithMinRole, checkRole } from './utilities'

// Allow public (unauthenticated) users to create participants
export const publicParticipantCreate: Access = async ({ req: { user, payload } }) => {
  // Allow public access (no authentication required)
  if (!user) {
    return true
  }

  // If user is authenticated, use same logic as team-aware create
  // Super-admins and admins can create records in any team
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can create records (viewers cannot)
  const teamIds = await getUserTeamIdsWithMinRole(payload, user, 'editor')

  if (teamIds.length > 0) {
    return {
      team: {
        in: teamIds,
      },
    }
  }

  return false
}

// Read access - team aware for authenticated users only
export const publicParticipantRead: Access = async ({ req: { user, payload } }) => {
  // No public read access
  if (!user) {
    return false
  }

  // Super-admins and admins can read all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Non-admin users can only read records from their teams
  const teamIds = await getUserTeamIds(payload, user)

  if (teamIds.length > 0) {
    return {
      team: {
        in: teamIds,
      },
    }
  }

  return false
}
