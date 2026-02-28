import type { CollectionAfterChangeHook } from 'payload'

export const generatePublicFormLinkAfterCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Return early if this hook was already triggered to prevent infinite loop
  if (context.skipPublicFormLinkGeneration) {
    return doc
  }

  // Only run on create operation and if link is missing
  if (operation === 'create' && !doc.publicFormLink && doc.id) {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const publicFormLink = `${baseUrl}/partner-register/${doc.id}`

    // Update the document directly in the database to avoid API routing issues
    try {
      await req.payload.db.updateOne({
        collection: 'partner-types',
        where: { id: { equals: doc.id } },
        data: { publicFormLink },
        req,
      })

      // Update the returned doc to reflect the change
      doc.publicFormLink = publicFormLink
    } catch (error) {
      console.error('Error generating public form link:', error)
    }
  }

  return doc
}
