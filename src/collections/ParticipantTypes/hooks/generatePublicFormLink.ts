import type { CollectionAfterChangeHook } from 'payload'

export const generatePublicFormLink: CollectionAfterChangeHook = async ({
  doc,
  req,
  context,
}) => {
  if (context.skipPublicFormLink) return doc

  const hasEvent = !!doc.event

  // Clear the link when no event is linked
  if (!hasEvent) {
    if (doc.publicFormLink) {
      await req.payload.update({
        collection: 'participant-types',
        id: doc.id,
        data: { publicFormLink: null },
        context: { skipPublicFormLink: true },
        req,
      })
      doc.publicFormLink = null
    }
    return doc
  }

  // Generate link when event is present and link is missing
  if (!doc.publicFormLink) {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const publicFormLink = `${baseUrl}/register/${doc.id}`

    try {
      await req.payload.update({
        collection: 'participant-types',
        id: doc.id,
        data: { publicFormLink },
        context: { skipPublicFormLink: true },
        req,
      })
      doc.publicFormLink = publicFormLink
    } catch (error) {
      console.error('Error generating public form link:', error)
    }
  }

  return doc
}
