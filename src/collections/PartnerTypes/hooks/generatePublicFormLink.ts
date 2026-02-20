import type { CollectionAfterChangeHook } from 'payload'

export const generatePublicFormLink: CollectionAfterChangeHook = async ({ doc, req, operation, context }) => {
  // Skip if this update was triggered by this hook to prevent infinite loop
  if (context?.skipPublicFormLinkGeneration) {
    return doc
  }

  const hasEvent = !!doc.event

  // Clear the link when no event is linked
  if (!hasEvent && doc.publicFormLink) {
    try {
      await req.payload.update({
        collection: 'partner-types',
        id: doc.id,
        data: { publicFormLink: null },
        context: { skipPublicFormLinkGeneration: true },
      })
    } catch (error) {
      console.error('Error clearing public form link:', error)
    }
    return { ...doc, publicFormLink: null }
  }

  // Generate link when event is present and link is missing
  if (hasEvent && !doc.publicFormLink && doc.id) {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const publicFormLink = `${baseUrl}/partner-register/${doc.id}`

    try {
      await req.payload.update({
        collection: 'partner-types',
        id: doc.id,
        data: { publicFormLink },
        context: { skipPublicFormLinkGeneration: true },
      })
    } catch (error) {
      console.error('Error generating public form link:', error)
    }
    return { ...doc, publicFormLink }
  }

  return doc
}
