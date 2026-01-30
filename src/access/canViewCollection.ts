import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Check if user can view a specific collection
 * - Super-admins and admins can view all collections
 * - Regular users cannot view collections
 */
export const canViewCollection = (collectionSlug: string): Access => {
  return ({ req: { user } }) => {
    if (!user) return false

    // Super-admins and admins can view everything
    return checkRole(['super-admin', 'admin'], user)
  }
}
