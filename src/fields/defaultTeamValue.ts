import { getUserTeamIds } from '@/access/utilities'

/**
 * Default value function for team fields
 * Automatically selects the team if the user has exactly one team
 */
export const defaultTeamValue = async ({ user, req }: any) => {
  if (!user) return undefined

  try {
    const teamIds = await getUserTeamIds(req.payload, user)

    // If user has exactly one team, return it as default
    if (teamIds.length === 1) {
      return teamIds[0]
    }
  } catch (error) {
    console.error('[defaultTeamValue] Error getting team:', error)
  }

  return undefined
}
