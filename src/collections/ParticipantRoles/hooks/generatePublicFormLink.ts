import type { CollectionBeforeChangeHook } from 'payload'

export const generatePublicFormLink: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  // Only generate link if it doesn't exist and we have an ID (for updates)
  // For creates, we'll use an afterChange hook to update once ID is available
  if (operation === 'update' && !data.publicFormLink && originalDoc?.id) {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || '/'
    data.publicFormLink = `${baseUrl}/participant-register/${originalDoc.id}`
  }

  return data
}
