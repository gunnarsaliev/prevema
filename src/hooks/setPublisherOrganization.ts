import type { CollectionBeforeChangeHook } from 'payload'
import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Hook to automatically set the publisher organization when a template
 * is marked as public library (isPublicLibrary: true).
 * Sets publisherOrganization to the template's organization field,
 * or falls back to the user's first organization.
 */
export const setPublisherOrganization: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  const { user, payload } = req

  // Only process if isPublicLibrary is being set to true
  if (data.isPublicLibrary) {
    // If publisherOrganization is not already set, use the organization field
    if (!data.publisherOrganization && data.organization) {
      data.publisherOrganization = data.organization
    }

    // If still no publisherOrganization, use the user's first organization
    if (!data.publisherOrganization && user && payload) {
      try {
        const userOrgIds = await getUserOrganizationIds(payload, user)
        if (userOrgIds.length > 0) {
          data.publisherOrganization = userOrgIds[0]
        }
      } catch (error) {
        console.error('Error getting user organizations in setPublisherOrganization hook:', error)
      }
    }
  }

  // If this is a copy operation (isCopy: true with copiedFrom set),
  // ensure isPublicLibrary is false and isPublic is false
  if (data.isCopy && data.copiedFrom) {
    data.isPublicLibrary = false
    data.isPublic = false
    data.publisherOrganization = null
  }

  return data
}
