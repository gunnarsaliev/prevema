import type { FieldAccess } from 'payload'

import { checkRole } from '@/access/utilities'

export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['super-admin'], user)

  return false
}
