import type { CollectionAfterChangeHook } from 'payload'
import type { Partner } from '@/payload-types'
import { triggerAutomatedEmails } from '@/services/emailAutomation'
import { buildPartnerVariables, addCommonVariables } from '@/services/emailVariables'

/**
 * Hook to trigger automated emails when a partner is created or invited
 */
export const handleEmailAutomation: CollectionAfterChangeHook<Partner> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  try {
    // Skip if no team or email
    if (!doc.team || !doc.email) {
      console.log('⏭️  Skipping partner email automation: missing team or email')
      return doc
    }

    // Get team ID and object
    const teamId = typeof doc.team === 'object' ? doc.team.id : doc.team
    const team = typeof doc.team === 'object' ? doc.team : undefined

    // Fetch relationship data if needed
    let partnerTypeName = ''
    let partnerTierName = ''

    // Get partnerType name
    if (doc.partnerType) {
      if (typeof doc.partnerType === 'object' && doc.partnerType.name) {
        partnerTypeName = doc.partnerType.name
      } else if (typeof doc.partnerType === 'number') {
        try {
          const typeDoc = await payload.findByID({
            collection: 'partner-types',
            id: doc.partnerType,
          })
          partnerTypeName = typeDoc.name || ''
        } catch (error) {
          console.warn('Could not fetch partner type:', error)
        }
      }
    }

    // Get partner tier name (if exists)
    if (doc.tier) {
      if (typeof doc.tier === 'object' && doc.tier.name) {
        partnerTierName = doc.tier.name
      } else if (typeof doc.tier === 'number') {
        try {
          const tierDoc = await payload.findByID({
            collection: 'partner-tiers',
            id: doc.tier,
          })
          partnerTierName = tierDoc.name || ''
        } catch (error) {
          console.warn('Could not fetch partner tier:', error)
        }
      }
    }

    // Build standardized partner variables using the registry
    const partnerVariables = buildPartnerVariables({
      name: doc.contactPerson,
      email: doc.email,
      status: doc.status,
      partnerType: partnerTypeName,
      partnerTier: partnerTierName,
      companyName: doc.companyName,
      companyWebsite: doc.companyWebsiteUrl,
      contactPerson: doc.contactPerson,
      createdAt: doc.createdAt,
      socialPostLinkedIn: doc.socialPostLinkedIn,
      socialPostTwitter: doc.socialPostTwitter,
      socialPostFacebook: doc.socialPostFacebook,
      socialPostInstagram: doc.socialPostInstagram,
      socialPostGeneratedAt: doc.socialPostGeneratedAt,
    })

    // Add common variables (tenantName, currentYear, etc.)
    const partnerData = addCommonVariables(partnerVariables, team)

    // For partners, we primarily trigger on creation (invitation)
    const triggerEvent = 'partner.invited'

    if (operation === 'create') {
      console.log(`🤝 Partner invited: ${doc.companyName} (${doc.email})`)

      // Trigger automated emails
      const result = await triggerAutomatedEmails({
        payload,
        triggerData: {
          event: triggerEvent,
          teamId,
          recipientEmail: doc.email,
          data: partnerData,
        },
      })

      if (result.sent > 0) {
        console.log(`✅ Sent ${result.sent} automated email(s) to ${doc.email}`)
      }

      if (result.errors.length > 0) {
        console.error(`⚠️  Errors sending automated emails:`, result.errors)
      }
    } else {
      console.log(`📝 Partner updated: ${doc.companyName} - No automated emails sent`)
    }
  } catch (error) {
    console.error('❌ Error in partner handleEmailAutomation hook:', error)
    // Don't throw - email failures shouldn't break partner creation/updates
  }

  return doc
}
