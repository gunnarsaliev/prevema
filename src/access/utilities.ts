import type { User } from '@/payload-types'
import type { Payload } from 'payload'

export const checkRole = (allRoles: User['roles'] = [], user?: User | null): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole) => {
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

export const canCreateTeams = (user?: User | null): boolean => {
  // Super-admins and admins can always create teams
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // All pricing plans can create teams (with different limits)
  return user?.pricingPlan === 'free' || user?.pricingPlan === 'pro' || user?.pricingPlan === 'teams' || user?.pricingPlan === 'unlimited'
}

/**
 * Get the maximum number of teams a user can create based on their pricing plan
 * @param user - The user object
 * @returns Maximum team count (null = unlimited)
 */
export const getTeamLimit = (user?: User | null): number | null => {
  // Super-admins and admins have unlimited teams
  if (checkRole(['super-admin', 'admin'], user)) {
    return null
  }

  // Check pricing plan
  switch (user?.pricingPlan) {
    case 'free':
      return 1
    case 'pro':
      return 3
    case 'teams':
      return 20
    case 'unlimited':
      return null
    default:
      return 0
  }
}

export const canParticipateInTeams = (user?: User | null): boolean => {
  // Super-admins and admins can always participate
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // All pricing plans can participate in teams
  return true
}

/**
 * Get the user's role for a specific team
 * @param payload - The Payload instance
 * @param user - The user object
 * @param teamId - The team ID to check
 * @returns The role ('owner' | 'admin' | 'editor' | 'viewer') or null if user is not in the team
 */
export const getTeamRole = async (
  payload: Payload,
  user?: User | null,
  teamId?: number | string,
): Promise<'owner' | 'admin' | 'editor' | 'viewer' | null> => {
  if (!user || !teamId) return null

  try {
    const team = await payload.findByID({
      collection: 'teams',
      id: String(teamId),
      depth: 0,
    })

    if (!team) return null

    // Check if user is the owner
    const ownerId = typeof team.owner === 'object' ? team.owner?.id : team.owner
    if (String(ownerId) === String(user.id)) {
      return 'owner'
    }

    // Check if user is in members array
    if (!team.members) return null

    const memberEntry = team.members.find((m: any) => {
      const userId = typeof m.user === 'object' ? m.user?.id : m.user
      return String(userId) === String(user.id)
    })

    return memberEntry?.role || null
  } catch (error) {
    console.error('Error fetching team role:', error)
    return null
  }
}

/**
 * Check if user has a specific role in a team
 * @param payload - The Payload instance
 * @param user - The user object
 * @param teamId - The team ID to check
 * @param requiredRole - The role to check for ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns True if user has the required role or higher
 */
export const hasTeamRole = async (
  payload: Payload,
  user?: User | null,
  teamId?: number | string,
  requiredRole?: 'owner' | 'admin' | 'editor' | 'viewer',
): Promise<boolean> => {
  if (!user || !teamId || !requiredRole) return false

  const userRole = await getTeamRole(payload, user, teamId)
  if (!userRole) return false

  // Role hierarchy: owner > admin > editor > viewer
  const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user is an owner of a specific team
 * @param payload - The Payload instance
 * @param user - The user object
 * @param teamId - The team ID to check
 * @returns True if user is an owner of the team
 */
export const isTeamOwner = async (
  payload: Payload,
  user?: User | null,
  teamId?: number | string,
): Promise<boolean> => {
  return hasTeamRole(payload, user, teamId, 'owner')
}

/**
 * Get all team IDs where user has a specific role
 * @param payload - The Payload instance
 * @param user - The user object
 * @param role - Optional role filter ('owner' | 'editor' | 'viewer')
 * @returns Array of team IDs
 */
export const getUserTeamIds = async (
  payload: Payload,
  user?: User | null,
  role?: 'owner' | 'editor' | 'viewer',
): Promise<(number | string)[]> => {
  if (!user) return []

  try {
    // Query all teams where this user is either the owner OR a member
    const teams = await payload.find({
      collection: 'teams',
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
      limit: 1000, // Reasonable limit for user's teams
    })

    if (!teams.docs || teams.docs.length === 0) return []

    // Filter by role if specified
    const teamIds: (number | string)[] = []
    for (const team of teams.docs) {
      // Check if user is the owner
      const ownerId = typeof team.owner === 'object' ? team.owner?.id : team.owner
      const isOwner = String(ownerId) === String(user.id)

      if (isOwner) {
        // If user is owner, always include (owners have implicit 'owner' role)
        if (!role || role === 'owner') {
          teamIds.push(team.id)
        }
        continue
      }

      // Check if user is in members array
      if (!team.members) continue

      const memberEntry = team.members.find((m: any) => {
        const userId = typeof m.user === 'object' ? m.user?.id : m.user
        return String(userId) === String(user.id)
      })

      // If role filter is specified, only include if user has that role
      if (!role || memberEntry?.role === role) {
        teamIds.push(team.id)
      }
    }

    return teamIds
  } catch (error) {
    console.error('Error fetching user team IDs:', error)
    return []
  }
}

/**
 * Get all team IDs where user has at least the specified role level
 * Role hierarchy: owner > admin > editor > viewer
 * @param payload - The Payload instance
 * @param user - The user object
 * @param minRole - Minimum required role ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns Array of team IDs
 */
export const getUserTeamIdsWithMinRole = async (
  payload: Payload,
  user?: User | null,
  minRole: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer',
): Promise<(number | string)[]> => {
  if (!user) return []

  try {
    // Query all teams where this user is either the owner OR a member
    const teams = await payload.find({
      collection: 'teams',
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
      limit: 1000, // Reasonable limit for user's teams
    })

    if (!teams.docs || teams.docs.length === 0) return []

    // Role hierarchy: owner (4) > admin (3) > editor (2) > viewer (1)
    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 }
    const minRoleLevel = roleHierarchy[minRole]

    // Filter by role hierarchy
    const teamIds: (number | string)[] = []
    for (const team of teams.docs) {
      // Check if user is the owner
      const ownerId = typeof team.owner === 'object' ? team.owner?.id : team.owner
      const isOwner = String(ownerId) === String(user.id)

      if (isOwner) {
        // Owner has the highest role level (4)
        if (roleHierarchy.owner >= minRoleLevel) {
          teamIds.push(team.id)
        }
        continue
      }

      // Check if user is in members array
      if (!team.members) continue

      const memberEntry = team.members.find((m: any) => {
        const userId = typeof m.user === 'object' ? m.user?.id : m.user
        return String(userId) === String(user.id)
      })

      // Check if user has at least the minimum required role
      if (memberEntry?.role && roleHierarchy[memberEntry.role] >= minRoleLevel) {
        teamIds.push(team.id)
      }
    }

    return teamIds
  } catch (error) {
    console.error('Error fetching user team IDs with min role:', error)
    return []
  }
}
