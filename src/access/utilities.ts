import type { User } from '@/payload-types'
import type { Payload } from 'payload'

export const checkRole = (allRoles: User['roles'] = [], user?: User | null | any): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole: any) => {
        return individualRole === role
      })
    })
  }

  return false
}

export const checkPricingPlan = (
  allowedPlans: User['pricingPlan'][] = [],
  user?: User | null,
): boolean => {
  // Super-admins and admins bypass pricing plan restrictions
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  if (user && user.pricingPlan && allowedPlans.length > 0) {
    return allowedPlans.includes(user.pricingPlan)
  }
  return false
}

/**
 * @deprecated This function is deprecated. All authenticated users can now create organizations.
 * Organization limits are now managed through the Subscriptions collection.
 * Super-admins and admins get unlimited subscriptions automatically.
 */
export const canCreateOrganizations = (user?: User | null): boolean => {
  // All authenticated users can create organizations
  // Organization-level limits are now managed via Subscriptions
  return !!user
}

/**
 * @deprecated This function is deprecated. Organization limits are now managed per-organization
 * via the Subscriptions collection, not at the user level. Use the subscription helpers instead.
 * @see /src/lib/stripe/subscriptionHelpers.ts
 */
export const getOrganizationLimit = (user?: User | null): number | null => {
  // Super-admins and admins have unlimited organizations (via system-unlimited subscription)
  if (checkRole(['super-admin', 'admin'], user)) {
    return null
  }

  // Regular users can create unlimited organizations
  // Each organization has its own subscription with seat limits
  return null
}

export const canParticipateInOrganizations = (user?: User | null): boolean => {
  // Super-admins and admins can always participate
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // All pricing plans can participate in organizations
  return true
}

/**
 * Get the user's role for a specific organization
 * @param payload - The Payload instance
 * @param user - The user object
 * @param organizationId - The organization ID to check
 * @returns The role ('owner' | 'admin' | 'editor' | 'viewer') or null if user is not in the organization
 */
export const getOrganizationRole = async (
  payload: Payload,
  user?: User | null,
  organizationId?: number | string,
): Promise<'owner' | 'admin' | 'editor' | 'viewer' | null> => {
  if (!user || !organizationId) return null

  try {
    // Query the members collection for this user-organization pair
    const membership = await payload.find({
      collection: 'members',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            organization: {
              equals: organizationId,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
      limit: 1,
    })

    if (membership.docs.length === 0) return null

    return membership.docs[0].role || null
  } catch (error) {
    console.error('Error fetching organization role:', error)
    return null
  }
}

/**
 * Check if user has a specific role in an organization
 * @param payload - The Payload instance
 * @param user - The user object
 * @param organizationId - The organization ID to check
 * @param requiredRole - The role to check for ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns True if user has the required role or higher
 */
export const hasOrganizationRole = async (
  payload: Payload,
  user?: User | null,
  organizationId?: number | string,
  requiredRole?: 'owner' | 'admin' | 'editor' | 'viewer',
): Promise<boolean> => {
  if (!user || !organizationId || !requiredRole) return false

  const userRole = await getOrganizationRole(payload, user, organizationId)
  if (!userRole) return false

  // Role hierarchy: owner > admin > editor > viewer
  const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user is an owner of a specific organization
 * @param payload - The Payload instance
 * @param user - The user object
 * @param organizationId - The organization ID to check
 * @returns True if user is an owner of the organization
 */
export const isOrganizationOwner = async (
  payload: Payload,
  user?: User | null,
  organizationId?: number | string,
): Promise<boolean> => {
  return hasOrganizationRole(payload, user, organizationId, 'owner')
}

/**
 * Get all organization IDs where user has a specific role
 * @param payload - The Payload instance
 * @param user - The user object
 * @param role - Optional role filter ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns Array of organization IDs
 */
export const getUserOrganizationIds = async (
  payload: Payload,
  user?: User | null,
  role?: 'owner' | 'admin' | 'editor' | 'viewer',
): Promise<(number | string)[]> => {
  if (!user) return []

  try {
    // Build the query
    const whereCondition: any = {
      and: [
        {
          user: {
            equals: user.id,
          },
        },
        {
          status: {
            equals: 'active',
          },
        },
      ],
    }

    // Add role filter if specified
    if (role) {
      whereCondition.and.push({
        role: {
          equals: role,
        },
      })
    }

    // Query the members collection
    const memberships = await payload.find({
      collection: 'members',
      where: whereCondition,
      depth: 0,
      limit: 1000, // Reasonable limit for user's organizations
    })

    if (!memberships.docs || memberships.docs.length === 0) return []

    // Extract organization IDs
    const organizationIds = memberships.docs.map((membership) =>
      typeof membership.organization === 'object'
        ? membership.organization.id
        : membership.organization,
    )

    return organizationIds
  } catch (error) {
    console.error('Error fetching user organization IDs:', error)
    return []
  }
}

/**
 * Get all organization IDs where user has at least the specified role level
 * Role hierarchy: owner > admin > editor > viewer
 * @param payload - The Payload instance
 * @param user - The user object
 * @param minRole - Minimum required role ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns Array of organization IDs
 */
export const getUserOrganizationIdsWithMinRole = async (
  payload: Payload,
  user?: User | null,
  minRole: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer',
): Promise<(number | string)[]> => {
  if (!user) return []

  try {
    // Role hierarchy: owner (4) > admin (3) > editor (2) > viewer (1)
    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 }
    const minRoleLevel = roleHierarchy[minRole]

    // Get roles that meet the minimum requirement
    const validRoles = (Object.keys(roleHierarchy) as Array<keyof typeof roleHierarchy>).filter(
      (role) => roleHierarchy[role] >= minRoleLevel,
    )

    // Query the members collection for active memberships with sufficient role level
    const memberships = await payload.find({
      collection: 'members',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
          {
            role: {
              in: validRoles,
            },
          },
        ],
      },
      depth: 0,
      limit: 1000, // Reasonable limit for user's organizations
    })

    if (!memberships.docs || memberships.docs.length === 0) return []

    // Extract organization IDs
    const organizationIds = memberships.docs.map((membership) =>
      typeof membership.organization === 'object'
        ? membership.organization.id
        : membership.organization,
    )

    return organizationIds
  } catch (error) {
    console.error('Error fetching user organization IDs with min role:', error)
    return []
  }
}

/**
 * Check if user has premium access
 * @param payload - The Payload instance
 * @param user - The user object
 * @param organizationIds - Optional array of organization IDs to check (for organization-level premium)
 * @returns True if user has premium access
 */
export const checkUserPremiumAccess = async (
  payload: Payload,
  user?: User | null,
  organizationIds?: (number | string)[],
): Promise<boolean> => {
  // Super-admins and admins always have premium access
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  if (!user) return false

  // Check user's pricing plan
  // Premium plans: 'pro', 'organizations', 'unlimited'
  const premiumPlans: User['pricingPlan'][] = ['pro', 'organizations', 'unlimited']
  if (user.pricingPlan && premiumPlans.includes(user.pricingPlan)) {
    return true
  }

  // TODO: Add organization-level subscription checks here
  // This would involve querying a subscriptions collection to check
  // if any of the user's organizations have active premium subscriptions

  return false
}
