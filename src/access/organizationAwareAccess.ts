import type { Access } from 'payload'
import { getUserOrganizationIds, getUserOrganizationIdsWithMinRole, checkRole } from './utilities'

export const organizationAwareRead: Access = async ({ req: { user, payload } }) => {
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

export const organizationAwareCreate: Access = async ({ req: { user, payload } }) => {
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

export const organizationAwareUpdate: Access = async ({ req: { user, payload } }) => {
  // Super-admins and admins can update all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can update records (viewers cannot)
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

export const organizationAwareDelete: Access = async ({ req: { user, payload } }) => {
  // Super-admins and admins can delete all records
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Only editors and owners can delete records (viewers cannot)
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
