import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Check if user can edit a specific collection
 * - Super-admins and admins can edit all collections
 * - Regular users cannot edit collections
 */
export const canEditCollection = (collectionSlug: string): Access => {
  return ({ req: { user } }) => {
    if (!user) return false

    // Super-admins and admins can edit everything
    return checkRole(['super-admin', 'admin'], user)
  }
}
