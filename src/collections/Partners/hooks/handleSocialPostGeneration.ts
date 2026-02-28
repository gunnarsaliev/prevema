import type { CollectionAfterChangeHook } from 'payload'
import type { Partner } from '@/payload-types'
import { generateAllPlatformPosts } from '@/services/socialPostGeneration'

/**
 * Hook to automatically generate social media posts for all platforms when a partner is created
 */
export const handleSocialPostGeneration: CollectionAfterChangeHook<Partner> = async ({
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
      console.log('⏭️  Skipping social post generation: not a new partner or posts already exist')
      return doc
    }

    console.log(`🎨 Generating social posts for partner: ${doc.companyName}`)

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
      partnerData: fullDoc,
      eventName,
      eventDescription,
      eventWhy,
      eventWhat,
      eventWhere,
      eventWho,
      eventTheme,
    })

    // Update the partner with all generated social posts using direct database access
    await req.payload.db.updateOne({
      collection: 'partners',
      where: { id: { equals: doc.id } },
      data: {
        socialPostLinkedIn: posts.linkedin,
        socialPostTwitter: posts.twitter,
        socialPostFacebook: posts.facebook,
        socialPostInstagram: posts.instagram,
        socialPostGeneratedAt: new Date().toISOString(),
      },
      req,
    })

    console.log(`✅ Generated social posts for all platforms for partner: ${doc.companyName}`)
  } catch (error) {
    console.error('❌ Error generating social posts for partner:', error)
    // Don't throw - social post generation failures shouldn't break partner creation
  }

  return doc
}
