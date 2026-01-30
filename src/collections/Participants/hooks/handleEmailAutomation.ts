import type { CollectionAfterChangeHook } from 'payload'
import type { Participant } from '@/payload-types'
import { triggerAutomatedEmails } from '@/services/emailAutomation'
import { buildParticipantVariables, addCommonVariables } from '@/services/emailVariables'

/**
 * Hook to trigger automated emails when a participant is created or updated
 */
export const handleEmailAutomation: CollectionAfterChangeHook<Participant> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  try {
    // Skip if no organization or email
    if (!doc.organization || !doc.email) {
      console.log('⏭️  Skipping email automation: missing organization or email')
      return doc
    }

    // Get organization ID and object
    const organizationId =
      typeof doc.organization === 'object' ? doc.organization.id : doc.organization
    const organization = typeof doc.organization === 'object' ? doc.organization : undefined

    // Fetch the full participant with populated relationships
    const fullDoc = await payload.findByID({
      collection: 'participants',
      id: doc.id,
      depth: 2, // Populate relationships up to 2 levels deep
    })

    // Fetch relationship data from the fully populated document
    let participantTypeName = ''
    let eventTitle = ''

    // Get participantType name
    if (fullDoc.participantType) {
      if (typeof fullDoc.participantType === 'object' && fullDoc.participantType.name) {
        participantTypeName = fullDoc.participantType.name
      } else if (typeof fullDoc.participantType === 'number') {
        try {
          const typeDoc = await payload.findByID({
            collection: 'participant-types',
            id: fullDoc.participantType,
          })
          participantTypeName = typeDoc.name || ''
        } catch (error) {
          console.warn('Could not fetch participant type:', error)
        }
      }
    }

    // Get event name (not title - the field is called "name" in the events collection)
    if (fullDoc.event) {
      if (typeof fullDoc.event === 'object' && fullDoc.event.name) {
        eventTitle = fullDoc.event.name
      } else if (typeof fullDoc.event === 'number') {
        try {
          const eventDoc = await payload.findByID({
            collection: 'events',
            id: fullDoc.event,
          })
          eventTitle = eventDoc.name || ''
        } catch (error) {
          console.warn('Could not fetch event:', error)
        }
      }
    }

    // Build standardized participant variables using the registry
    const participantVariables = buildParticipantVariables({
      name: doc.name,
      email: doc.email,
      status: doc.status,
      participantType: participantTypeName,
      event: eventTitle,
      companyName: doc.companyName,
      companyPosition: doc.companyPosition,
      country: doc.country,
      phoneNumber: doc.phoneNumber,
      registrationDate: doc.registrationDate,
      socialPostLinkedIn: doc.socialPostLinkedIn,
      socialPostTwitter: doc.socialPostTwitter,
      socialPostFacebook: doc.socialPostFacebook,
      socialPostInstagram: doc.socialPostInstagram,
      socialPostGeneratedAt: doc.socialPostGeneratedAt,
    })

    // Add common variables (tenantName, currentYear, etc.)
    const participantData = addCommonVariables(participantVariables, organization)

    // Determine which event to trigger
    let triggerEvent: 'participant.created' | 'participant.updated'
    let previousData: Record<string, any> | undefined

    if (operation === 'create') {
      triggerEvent = 'participant.created'
      console.log(`🆕 Participant created: ${doc.name} (${doc.email})`)
    } else {
      triggerEvent = 'participant.updated'
      previousData = previousDoc
        ? {
            status: previousDoc.status,
            name: previousDoc.name,
          }
        : undefined
      console.log(`📝 Participant updated: ${doc.name} (${doc.email})`)

      // Only trigger if status actually changed
      if (previousData && previousData.status === doc.status) {
        console.log(`⏭️  Skipping email automation: status unchanged (${doc.status})`)
        return doc
      }
    }

    // Trigger automated emails
    const result = await triggerAutomatedEmails({
      payload,
      triggerData: {
        event: triggerEvent,
        organizationId,
        recipientEmail: doc.email,
        data: participantData,
        previousData,
      },
    })

    if (result.sent > 0) {
      console.log(`✅ Sent ${result.sent} automated email(s) to ${doc.email}`)
    }

    if (result.errors.length > 0) {
      console.error(`⚠️  Errors sending automated emails:`, result.errors)
    }
  } catch (error) {
    console.error('❌ Error in handleEmailAutomation hook:', error)
    // Don't throw - email failures shouldn't break participant creation/updates
  }

  return doc
}
