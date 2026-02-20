import type { CollectionBeforeChangeHook } from 'payload'

export const generatePublicFormLink: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  const hasEvent = !!data.event

  // Clear the link when no event is linked
  if (!hasEvent) {
    data.publicFormLink = null
    return data
  }

  // Generate link when event is present and link is missing
  // For create operations, we need to generate after we have an ID, so skip here
  if (operation === 'create' || !data.publicFormLink) {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    // For create, we'll use the slug as placeholder - it will be updated in afterChange if needed
    const identifier = data.slug || 'new'
    data.publicFormLink = `${baseUrl}/partner-register/${identifier}`
  }

  return data
}
