import type { CollectionAfterChangeHook } from 'payload'

export const generatePublicFormLink: CollectionAfterChangeHook = async ({ doc, req }) => {
  const hasEvent = !!doc.event

  // Clear the link when no event is linked
  if (!hasEvent) {
    if (doc.publicFormLink) {
      await req.payload.update({
        collection: 'partner-types',
        id: doc.id,
        data: { publicFormLink: null },
      })
      doc.publicFormLink = null
    }
    return doc
  }

  // Generate link when event is present and link is missing
  if (!doc.publicFormLink) {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const publicFormLink = `${baseUrl}/partner-register/${doc.id}`

    try {
      await req.payload.update({
        collection: 'partner-types',
        id: doc.id,
        data: { publicFormLink },
      })
      doc.publicFormLink = publicFormLink
    } catch (error) {
      console.error('Error generating public form link:', error)
    }
  }

  return doc
}
