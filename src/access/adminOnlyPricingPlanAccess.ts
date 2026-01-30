import type { FieldAccess } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Field access control for pricing plan:
 * - All users can read their pricing plan
 * - Only super-admins and admins can create/update pricing plans
 */
export const adminOnlyPricingPlanAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['super-admin', 'admin'], user)

  return false
}
