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

export const canCreateOrganizations = (user?: User | null): boolean => {
  // Super-admins and admins can always create organizations
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // All pricing plans can create organizations (with different limits)
  return (
    user?.pricingPlan === 'free' ||
    user?.pricingPlan === 'pro' ||
    user?.pricingPlan === 'organizations' ||
    user?.pricingPlan === 'unlimited'
  )
}

/**
 * Get the maximum number of organizations a user can create based on their pricing plan
 * @param user - The user object
 * @returns Maximum organization count (null = unlimited)
 */
export const getOrganizationLimit = (user?: User | null): number | null => {
  // Super-admins and admins have unlimited organizations
  if (checkRole(['super-admin', 'admin'], user)) {
    return null
  }

  // Check pricing plan
  switch (user?.pricingPlan) {
    case 'free':
      return 1
    case 'pro':
      return 3
    case 'organizations':
      return 20
    case 'unlimited':
      return null
    default:
      return 0
  }
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
    const organization = await payload.findByID({
      collection: 'organizations',
      id: String(organizationId),
      depth: 0,
    })

    if (!organization) return null

    // Check if user is the owner
    const ownerId =
      typeof organization.owner === 'object' ? organization.owner?.id : organization.owner
    if (String(ownerId) === String(user.id)) {
      return 'owner'
    }

    // Check if user is in members array
    if (!organization.members) return null

    const memberEntry = organization.members.find((m: any) => {
      const userId = typeof m.user === 'object' ? m.user?.id : m.user
      return String(userId) === String(user.id)
    })

    return memberEntry?.role || null
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
 * @param role - Optional role filter ('owner' | 'editor' | 'viewer')
 * @returns Array of organization IDs
 */
export const getUserOrganizationIds = async (
  payload: Payload,
  user?: User | null,
  role?: 'owner' | 'editor' | 'viewer',
): Promise<(number | string)[]> => {
  if (!user) return []

  try {
    // Query all organizations where this user is either the owner OR a member
    const organizations = await payload.find({
      collection: 'organizations',
      where: {
        or: [
          {
            owner: {
              equals: user.id,
            },
          },
          {
            'members.user': {
              equals: user.id,
            },
          },
        ],
      },
      depth: 0,
      limit: 1000, // Reasonable limit for user's organizations
    })

    if (!organizations.docs || organizations.docs.length === 0) return []

    // Filter by role if specified
    const organizationIds: (number | string)[] = []
    for (const organization of organizations.docs) {
      // Check if user is the owner
      const ownerId =
        typeof organization.owner === 'object' ? organization.owner?.id : organization.owner
      const isOwner = String(ownerId) === String(user.id)

      if (isOwner) {
        // If user is owner, always include (owners have implicit 'owner' role)
        if (!role || role === 'owner') {
          organizationIds.push(organization.id)
        }
        continue
      }

      // Check if user is in members array
      if (!organization.members) continue

      const memberEntry = organization.members.find((m: any) => {
        const userId = typeof m.user === 'object' ? m.user?.id : m.user
        return String(userId) === String(user.id)
      })

      // If role filter is specified, only include if user has that role
      if (!role || memberEntry?.role === role) {
        organizationIds.push(organization.id)
      }
    }

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
    // Query all organizations where this user is either the owner OR a member
    const organizations = await payload.find({
      collection: 'organizations',
      where: {
        or: [
          {
            owner: {
              equals: user.id,
            },
          },
          {
            'members.user': {
              equals: user.id,
            },
          },
        ],
      },
      depth: 0,
      limit: 1000, // Reasonable limit for user's organizations
    })

    if (!organizations.docs || organizations.docs.length === 0) return []

    // Role hierarchy: owner (4) > admin (3) > editor (2) > viewer (1)
    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 }
    const minRoleLevel = roleHierarchy[minRole]

    // Filter by role hierarchy
    const organizationIds: (number | string)[] = []
    for (const organization of organizations.docs) {
      // Check if user is the owner
      const ownerId =
        typeof organization.owner === 'object' ? organization.owner?.id : organization.owner
      const isOwner = String(ownerId) === String(user.id)

      if (isOwner) {
        // Owner has the highest role level (4)
        if (roleHierarchy.owner >= minRoleLevel) {
          organizationIds.push(organization.id)
        }
        continue
      }

      // Check if user is in members array
      if (!organization.members) continue

      const memberEntry = organization.members.find((m: any) => {
        const userId = typeof m.user === 'object' ? m.user?.id : m.user
        return String(userId) === String(user.id)
      })

      // Check if user has at least the minimum required role
      if (memberEntry?.role && roleHierarchy[memberEntry.role] >= minRoleLevel) {
        organizationIds.push(organization.id)
      }
    }

    return organizationIds
  } catch (error) {
    console.error('Error fetching user organization IDs with min role:', error)
    return []
  }
}
