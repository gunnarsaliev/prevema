import type { CollectionAfterChangeHook } from 'payload'

export const generatePublicFormLink: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only generate link if it doesn't exist or if the document was just created
  if (!doc.publicFormLink || operation === 'create') {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const publicFormLink = `${baseUrl}/register/${doc.id}`

    // Update the document with the generated link
    try {
      await req.payload.update({
        collection: 'participant-types',
        id: doc.id,
        data: {
          publicFormLink,
        },
      })

      // Update the returned doc object so it includes the new link
      doc.publicFormLink = publicFormLink
    } catch (error) {
      console.error('Error generating public form link:', error)
    }
  }

  return doc
}
