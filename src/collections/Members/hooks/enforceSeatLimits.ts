import type { CollectionBeforeValidateHook } from 'payload'
import { canAddMember } from '@/lib/stripe/subscriptionHelpers'

/**
 * Hook to enforce seat limits when adding members to an organization
 * - Checks subscription seat availability
 * - Bypasses check for super-admins and admins
 * - Bypasses check for initial owner creation
 * - Throws error if no seats available
 */
export const enforceSeatLimits: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  console.log(`🪝 enforceSeatLimits hook fired - operation: ${operation}, isInitialOwner: ${req.context?.isInitialOwner}`)

  // Only enforce on create operations
  if (operation !== 'create') {
    console.log(`⏭️  Skipping seat limits - operation is ${operation}`)
    return data
  }

  // Only enforce if we're adding an active member
  if (!data || data.status !== 'active') {
    console.log(`⏭️  Skipping seat limits - status is ${data?.status}`)
    return data
  }

  // Skip seat limit check for initial owner creation during organization setup
  if (req.context?.isInitialOwner === true) {
    console.log(`✅ Bypassing seat limit check for initial owner`)
    return data
  }

  // Skip seat limit check for invitation acceptance - invitation was already validated when created
  if (req.context?.isInvitationAcceptance === true) {
    console.log(`✅ Bypassing seat limit check for invitation acceptance`)
    return data
  }

  console.log(`🔍 Checking seat limits for organization ${data.organization}`)

  const { user, payload } = req

  // Get the organization ID
  const organizationId =
    typeof data.organization === 'object' ? data.organization.id : data.organization

  if (!organizationId) {
    throw new Error('Organization is required to add a member')
  }

  // Check if member can be added
  const result = await canAddMember(payload, organizationId, user)

  if (!result.canAdd) {
    throw new Error(result.reason || 'Cannot add member to this organization')
  }

  return data
}
