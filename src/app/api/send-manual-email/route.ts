import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { sendTenantEmail } from '@/services/email'
import { buildParticipantVariables, buildPartnerVariables, addCommonVariables } from '@/services/emailVariables'

/**
 * API route for manual email sending from the dashboard
 * POST /api/send-manual-email
 */
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })

    const body = (await request.json()) as {
      templateId: string
      teamId: string
      recipientEmails?: string[]
      participantIds?: string[] // Auto-populate variables from participants
      partnerIds?: string[] // Auto-populate variables from partners
      variables?: Record<string, any>
      userId?: string
    }
    const { templateId, teamId, recipientEmails, participantIds, partnerIds, variables, userId } = body

    // Validate required fields
    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 })
    }

    if (!recipientEmails && !participantIds && !partnerIds) {
      return NextResponse.json(
        { success: false, error: 'Either recipientEmails, participantIds, or partnerIds is required' },
        { status: 400 },
      )
    }

    if (recipientEmails && (!Array.isArray(recipientEmails) || recipientEmails.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'recipientEmails must be a non-empty array' },
        { status: 400 },
      )
    }

    if (participantIds && (!Array.isArray(participantIds) || participantIds.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'participantIds must be a non-empty array' },
        { status: 400 },
      )
    }

    if (partnerIds && (!Array.isArray(partnerIds) || partnerIds.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'partnerIds must be a non-empty array' },
        { status: 400 },
      )
    }

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 })
    }

    // Fetch the template
    const template = await payload.findByID({
      collection: 'email-templates',
      id: templateId,
    })

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
    }

    // Verify team matches
    const templateTeamId =
      typeof template.team === 'object' ? template.team.id : template.team
    if (String(templateTeamId) !== String(teamId)) {
      return NextResponse.json(
        { success: false, error: 'Template does not belong to this team' },
        { status: 403 },
      )
    }

    // Fetch team for common variables
    const team = await payload.findByID({
      collection: 'teams',
      id: teamId,
    })

    // Prepare recipients list
    let recipients: Array<{ email: string; variables: Record<string, any> }> = []

    if (participantIds && participantIds.length > 0) {
      // Fetch all participants and auto-populate variables
      for (const participantId of participantIds) {
        try {
          const participant = await payload.findByID({
            collection: 'participants',
            id: participantId,
            depth: 2, // Populate relationships
          })

          // Get participant type name
          let participantTypeName = ''
          if (participant.participantType) {
            participantTypeName = typeof participant.participantType === 'object'
              ? participant.participantType.name || ''
              : ''
          }

          // Get event name
          let eventName = ''
          if (participant.event) {
            eventName = typeof participant.event === 'object'
              ? participant.event.name || ''
              : ''
          }

          // Build participant variables
          const participantVars = buildParticipantVariables({
            name: participant.name,
            email: participant.email,
            status: participant.status,
            participantType: participantTypeName,
            event: eventName,
            companyName: participant.companyName,
            companyPosition: participant.companyPosition,
            country: participant.country,
            phoneNumber: participant.phoneNumber,
            registrationDate: participant.registrationDate,
            socialPostLinkedIn: participant.socialPostLinkedIn,
            socialPostTwitter: participant.socialPostTwitter,
            socialPostFacebook: participant.socialPostFacebook,
            socialPostInstagram: participant.socialPostInstagram,
            socialPostGeneratedAt: participant.socialPostGeneratedAt,
          })

          // Add common variables
          const fullVariables = addCommonVariables(participantVars, team)

          // Merge with any custom variables provided
          const finalVariables = { ...fullVariables, ...(variables || {}) }

          recipients.push({
            email: participant.email,
            variables: finalVariables,
          })
        } catch (error) {
          console.error(`Failed to fetch participant ${participantId}:`, error)
          // Skip this participant
        }
      }
    } else if (partnerIds && partnerIds.length > 0) {
      // Fetch all partners and auto-populate variables
      for (const partnerId of partnerIds) {
        try {
          const partner = await payload.findByID({
            collection: 'partners',
            id: partnerId,
            depth: 2, // Populate relationships
          })

          // Get partner type name
          let partnerTypeName = ''
          if (partner.partnerType) {
            partnerTypeName = typeof partner.partnerType === 'object'
              ? partner.partnerType.name || ''
              : ''
          }

          // Get partner tier name
          let partnerTierName = ''
          if (partner.tier) {
            partnerTierName = typeof partner.tier === 'object'
              ? partner.tier.name || ''
              : ''
          }

          // Build partner variables
          const partnerVars = buildPartnerVariables({
            name: partner.contactPerson,
            email: partner.contactEmail || partner.email,
            status: partner.status,
            partnerType: partnerTypeName,
            partnerTier: partnerTierName,
            companyName: partner.companyName,
            companyWebsite: partner.companyWebsiteUrl,
            contactPerson: partner.contactPerson,
            createdAt: partner.createdDate,
            socialPostLinkedIn: partner.socialPostLinkedIn,
            socialPostTwitter: partner.socialPostTwitter,
            socialPostFacebook: partner.socialPostFacebook,
            socialPostInstagram: partner.socialPostInstagram,
            socialPostGeneratedAt: partner.socialPostGeneratedAt,
          })

          // Add common variables
          const fullVariables = addCommonVariables(partnerVars, team)

          // Merge with any custom variables provided
          const finalVariables = { ...fullVariables, ...(variables || {}) }

          recipients.push({
            email: partner.contactEmail || partner.email || '',
            variables: finalVariables,
          })
        } catch (error) {
          console.error(`Failed to fetch partner ${partnerId}:`, error)
          // Skip this partner
        }
      }
    } else if (recipientEmails && recipientEmails.length > 0) {
      // Use provided email list with generic variables
      const commonVars = addCommonVariables(variables || {}, team)
      recipients = recipientEmails.map(email => ({
        email,
        variables: commonVars,
      }))
    }

    // Send email to each recipient with streaming progress updates
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const results: Array<{ email: string; success: boolean; error?: string }> = []
        const totalCount = recipients.length

        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i]

          try {
            const result = await sendTenantEmail({
              payload,
              tenantId: teamId,
              templateName: template.name,
              to: recipient.email,
              variables: recipient.variables,
            })

            results.push({
              email: recipient.email,
              success: result.success,
              error: result.error,
            })

            // Log sent email
            if (result.success) {
              await payload.create({
                collection: 'email-logs',
                data: {
                  template: Number(templateId),
                  team: Number(teamId),
                  recipientEmail: recipient.email,
                  triggerEvent: 'manual',
                  variables: JSON.stringify(recipient.variables),
                  sentAt: new Date().toISOString(),
                  status: 'sent',
                  sentBy: userId ? Number(userId) : undefined,
                },
              })
            } else {
              // Log failed email
              await payload.create({
                collection: 'email-logs',
                data: {
                  template: Number(templateId),
                  team: Number(teamId),
                  recipientEmail: recipient.email,
                  triggerEvent: 'manual',
                  variables: JSON.stringify(recipient.variables),
                  sentAt: new Date().toISOString(),
                  status: 'failed',
                  errorMessage: result.error,
                  sentBy: userId ? Number(userId) : undefined,
                },
              })
            }

            // Send progress update
            const sentCount = i + 1
            const leftCount = totalCount - sentCount
            const successCount = results.filter((r) => r.success).length
            const failureCount = results.filter((r) => !r.success).length

            const progressData = {
              type: 'progress',
              sentCount,
              leftCount,
              totalCount,
              currentEmail: recipient.email,
              currentSuccess: result.success,
              successCount,
              failureCount,
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`))

            // Add 500ms delay between emails (except after the last one)
            if (i < recipients.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error'
            results.push({
              email: recipient.email,
              success: false,
              error: errorMsg,
            })

            // Send progress update for failed email
            const sentCount = i + 1
            const leftCount = totalCount - sentCount
            const successCount = results.filter((r) => r.success).length
            const failureCount = results.filter((r) => !r.success).length

            const progressData = {
              type: 'progress',
              sentCount,
              leftCount,
              totalCount,
              currentEmail: recipient.email,
              currentSuccess: false,
              successCount,
              failureCount,
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`))

            // Add 500ms delay between emails (except after the last one)
            if (i < recipients.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        }

        // Calculate final summary
        const successCount = results.filter((r) => r.success).length
        const failureCount = results.filter((r) => !r.success).length

        // Send final result
        const finalData = {
          type: 'complete',
          success: true,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount,
          },
          results,
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('❌ Error in send-manual-email API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
