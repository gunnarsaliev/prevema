import type { FieldHook } from 'payload'

import type { User } from '@/payload-types'

// ensure the first user created is a super-admin
// 1. lookup a single user on create as succinctly as possible
// 2. if there are no users found, append `super-admin` to the roles array
// access control is already handled by this fields `access` property
// it ensures that only super-admins can create and update the `roles` field
export const ensureFirstUserIsAdmin: FieldHook<User> = async ({ operation, req, value }) => {
  if (operation === 'create') {
    const users = await req.payload.find({ collection: 'users', depth: 0, limit: 0 })
    if (users.totalDocs === 0) {
      // if `super-admin` not in array of values, add it
      if (!(value || []).includes('super-admin')) {
        return [...(value || []), 'super-admin']
      }
    }
  }

  return value
}
