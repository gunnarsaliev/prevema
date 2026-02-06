import type { CollectionAfterChangeHook } from 'payload'
import type { Participant } from '@/payload-types'
import { generateAllPlatformPosts } from '@/services/socialPostGeneration'

/**
 * Hook to automatically generate social media posts for all platforms when a participant is created
 */
export const handleSocialPostGeneration: CollectionAfterChangeHook<Participant> = async ({
  doc,
  operation,
  req,
  context,
}) => {
  try {
    // Skip if we're already updating to prevent infinite loops
    if (context.skipSocialPostGeneration) {
      return doc
    }

    // Only generate on creation
    // Skip if social posts already exist (to avoid overwriting manual edits)
    if (operation !== 'create' || doc.socialPostLinkedIn) {
      console.log(
        '⏭️  Skipping social post generation: not a new participant or posts already exist',
      )
      return doc
    }

    console.log(`🎨 Generating social posts for participant: ${doc.name}`)

    // Use the doc parameter directly instead of re-fetching to avoid NotFound errors
    const fullDoc = doc

    // Get event details
    let eventName = ''
    let eventDescription = ''
    let eventWhy = ''
    let eventWhat = ''
    let eventWhere = ''
    let eventWho = ''
    let eventTheme = ''

    if (fullDoc.event && typeof fullDoc.event === 'object') {
      eventName = fullDoc.event.name || ''
      eventDescription = fullDoc.event.description || ''
      eventWhy = fullDoc.event.why || ''
      eventWhat = fullDoc.event.what || ''
      eventWhere = fullDoc.event.where || ''
      eventWho = fullDoc.event.who || ''
      eventTheme = fullDoc.event.theme || ''
    }

    // Generate posts for all platforms
    const posts = await generateAllPlatformPosts({
      participantData: fullDoc,
      eventName,
      eventDescription,
      eventWhy,
      eventWhat,
      eventWhere,
      eventWho,
      eventTheme,
    })

    // Update the participant with all generated social posts
    await req.payload.update({
      collection: 'participants',
      id: doc.id,
      data: {
        socialPostLinkedIn: posts.linkedin,
        socialPostTwitter: posts.twitter,
        socialPostFacebook: posts.facebook,
        socialPostInstagram: posts.instagram,
        socialPostGeneratedAt: new Date().toISOString(),
      },
      context: { skipSocialPostGeneration: true }, // Prevent infinite loop
      req, // Maintain transaction safety
    })

    console.log(`✅ Generated social posts for all platforms for participant: ${doc.name}`)
  } catch (error) {
    console.error('❌ Error generating social posts for participant:', error)
    // Don't throw - social post generation failures shouldn't break participant creation
  }

  return doc
}
