import type { CollectionBeforeValidateHook } from 'payload'
import { getUserTeamIds } from '@/access/utilities'

/**
 * Automatically selects the team when:
 * - A new record is being created
 * - No team has been manually selected yet
 * - The user has exactly one team available
 */
export const autoSelectTeam: CollectionBeforeValidateHook = async ({ req, data, operation }) => {
  if (operation === 'create' && !data?.team && req.user) {
    try {
      // Get user's teams
      const teamIds = await getUserTeamIds(req.payload, req.user)

      // If user has exactly one team, auto-populate it
      if (teamIds.length === 1) {
        data.team = teamIds[0]
      }
    } catch (error) {
      console.error('[autoSelectTeam] Error auto-selecting team:', error)
    }
  }

  return data
}
