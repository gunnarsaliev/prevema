import type { FieldHook } from 'payload'

import type { User } from '@/payload-types'

/**
 * Automatically assign "unlimited" pricing plan to super-admins and admins
 * This hook runs on both create and update operations
 */
export const assignUnlimitedToAdmins: FieldHook<User> = ({ data, value }) => {
  const roles = data?.roles || []

  // Check if user has super-admin or admin role
  const isAdminRole = roles.includes('super-admin') || roles.includes('admin')

  if (isAdminRole) {
    return 'unlimited'
  }

  // For non-admin users, keep their current pricing plan
  return value
}
