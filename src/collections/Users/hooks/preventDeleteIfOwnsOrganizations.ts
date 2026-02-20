import type { CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

export const preventDeleteIfOwnsOrganizations: CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  const { payload } = req

  try {
    // Check if the user owns any organizations
    const ownedOrganizations = await payload.count({
      collection: 'organizations',
      where: {
        owner: {
          equals: id,
        },
      },
    })

    if (ownedOrganizations.totalDocs > 0) {
      throw new APIError(
        `Cannot delete user: This user owns ${ownedOrganizations.totalDocs} organization${ownedOrganizations.totalDocs > 1 ? 's' : ''}. Please transfer ownership or delete the organization${ownedOrganizations.totalDocs > 1 ? 's' : ''} first.`,
        400,
      )
    }
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error
    }

    // Log other errors but don't block deletion
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(`Error checking user organizations: ${errorMessage}`)
  }

  return true
}
