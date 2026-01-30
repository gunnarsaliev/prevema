import type { Access } from 'payload'
import { getUserOrganizationIds, getUserOrganizationIdsWithMinRole, checkRole } from './utilities'

export const teamAwareRead: Access = async ({ req: { user, payload } }) => {
  // Super-admins and admins can read all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Non-admin users can only read records from their organizations
  const teamIds = await getUserOrganizationIds(payload, user)

  if (teamIds.length > 0) {
    return {
      team: {
        in: teamIds,
      },
    }
  }

  return false
}

export const teamAwareCreate: Access = async ({ req: { user, payload } }) => {
  // Super-admins and admins can create records in any organization
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can create records (viewers cannot)
  const teamIds = await getUserOrganizationIdsWithMinRole(payload, user, 'editor')

  if (teamIds.length > 0) {
    return {
      team: {
        in: teamIds,
      },
    }
  }

  return false
}

export const teamAwareUpdate: Access = async ({ req: { user, payload } }) => {
  // Super-admins and admins can update all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can update records (viewers cannot)
  const teamIds = await getUserOrganizationIdsWithMinRole(payload, user, 'editor')

  if (teamIds.length > 0) {
    return {
      team: {
        in: teamIds,
      },
    }
  }

  return false
}

export const teamAwareDelete: Access = async ({ req: { user, payload } }) => {
  // Super-admins and admins can delete all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can delete records (viewers cannot)
  const teamIds = await getUserOrganizationIdsWithMinRole(payload, user, 'editor')

  if (teamIds.length > 0) {
    return {
      team: {
        in: teamIds,
      },
    }
  }

  return false
}
