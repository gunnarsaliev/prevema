/**
 * Email Automation Service
 * Handles automatic email sending based on triggers configured in email templates
 */

import type { Payload } from 'payload'
import type { EmailTemplate } from '@/payload-types'
import { sendTenantEmail } from './email'

export type TriggerEvent =
  | 'participant.created'
  | 'participant.updated'
  | 'partner.invited'
  | 'event.published'
  | 'form.submitted'
  | 'custom'

export interface TriggerData {
  event: TriggerEvent
  organizationId: string | number
  recipientEmail: string
  data: Record<string, any>
  previousData?: Record<string, any> // For update events
}

/**
 * Main function to trigger automated emails based on an event
 */
export async function triggerAutomatedEmails({
  payload,
  triggerData,
}: {
  payload: Payload
  triggerData: TriggerData
}): Promise<{ sent: number; errors: string[] }> {
  const { event, organizationId, recipientEmail, data, previousData } = triggerData

  try {
    // Find all active templates with matching trigger event for this organization
    const templates = await payload.find({
      collection: 'email-templates',
      where: {
        and: [
          {
            organization: {
              equals: organizationId,
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
          {
            'automationTriggers.triggerEvent': {
              equals: event,
            },
          },
        ],
      },
      limit: 100,
    })

    if (templates.docs.length === 0) {
      console.log(
        `📭 No active templates found for event: ${event} (organization: ${organizationId})`,
      )
      return { sent: 0, errors: [] }
    }

    console.log(
      `📧 Found ${templates.docs.length} template(s) for event: ${event} (organization: ${organizationId})`,
    )

    let sent = 0
    const errors: string[] = []

    // Process each template
    for (const template of templates.docs) {
      try {
        // Check if template should be triggered based on conditions
        const shouldTrigger = await evaluateTriggerConditions({
          template,
          data,
          previousData,
        })

        if (!shouldTrigger) {
          console.log(`⏭️  Skipping template "${template.name}" - conditions not met`)
          continue
        }

        // Handle delayed sending
        const delayMinutes = template.automationTriggers?.delayMinutes || 0

        if (delayMinutes > 0) {
          console.log(
            `⏰ Scheduling template "${template.name}" to send in ${delayMinutes} minutes`,
          )
          await scheduleDelayedEmail({
            payload,
            template,
            organizationId,
            recipientEmail,
            variables: data,
            delayMinutes,
          })
        } else {
          // Send immediately
          console.log(`📤 Sending template "${template.name}" immediately`)
          const result = await sendTenantEmail({
            payload,
            tenantId: String(organizationId),
            templateName: template.name,
            to: recipientEmail,
            variables: data,
          })

          if (result.success) {
            sent++
            // Log the sent email
            await logEmailSent({
              payload,
              templateId: template.id,
              organizationId,
              recipientEmail,
              triggerEvent: event,
              variables: data,
              htmlContent: result.htmlContent,
              textContent: result.textContent,
            })
          } else {
            errors.push(`Template "${template.name}": ${result.error}`)
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error processing template "${template.name}":`, errorMsg)
        errors.push(`Template "${template.name}": ${errorMsg}`)
      }
    }

    return { sent, errors }
  } catch (error) {
    console.error('❌ Error in triggerAutomatedEmails:', error)
    throw error
  }
}

/**
 * Evaluate if template conditions are met
 */
async function evaluateTriggerConditions({
  template,
  data,
  previousData,
}: {
  template: EmailTemplate
  data: Record<string, any>
  previousData?: Record<string, any>
}): Promise<boolean> {
  // Check status filter (for status-based triggers)
  const statusFilter = template.automationTriggers?.statusFilter
  if (statusFilter && Array.isArray(statusFilter) && statusFilter.length > 0) {
    // For update events, check if status changed TO one of the filtered statuses
    if (previousData && data.status !== previousData.status) {
      if (!statusFilter.includes(data.status)) {
        console.log(`Status "${data.status}" not in filter: ${statusFilter.join(', ')}`)
        return false
      }
    } else if (!statusFilter.includes(data.status)) {
      // For creation events, just check current status
      console.log(`Status "${data.status}" not in filter: ${statusFilter.join(', ')}`)
      return false
    }
  }

  // Check custom JSON conditions
  const conditions = template.automationTriggers?.conditions
  if (conditions && conditions.trim() !== '') {
    try {
      const conditionsObj = JSON.parse(conditions)

      // Simple key-value matching
      for (const [key, value] of Object.entries(conditionsObj)) {
        if (data[key] !== value) {
          console.log(`Condition not met: ${key} should be "${value}" but is "${data[key]}"`)
          return false
        }
      }
    } catch (error) {
      console.error('❌ Invalid JSON in template conditions:', error)
      return false
    }
  }

  return true
}

/**
 * Schedule a delayed email (placeholder - would use a job queue in production)
 */
async function scheduleDelayedEmail({
  payload,
  template,
  organizationId,
  recipientEmail,
  variables,
  delayMinutes,
}: {
  payload: Payload
  template: EmailTemplate
  organizationId: string | number
  recipientEmail: string
  variables: Record<string, any>
  delayMinutes: number
}): Promise<void> {
  // In production, this would use a job queue like Bull, Agenda, or cloud-based solutions
  // For now, we'll use setTimeout (not recommended for production!)

  console.log(
    `⏰ Scheduling email "${template.name}" to ${recipientEmail} in ${delayMinutes} minutes`,
  )

  // Store in database for tracking (you could create a "scheduled_emails" collection)
  // For now, just log it

  // Simple setTimeout approach (loses state on server restart)
  setTimeout(
    async () => {
      try {
        const result = await sendTenantEmail({
          payload,
          tenantId: String(organizationId),
          templateName: template.name,
          to: recipientEmail,
          variables,
        })

        if (result.success) {
          await logEmailSent({
            payload,
            templateId: template.id,
            organizationId,
            recipientEmail,
            triggerEvent: 'scheduled',
            variables,
            htmlContent: result.htmlContent,
            textContent: result.textContent,
          })
        }
      } catch (error) {
        console.error('❌ Error sending scheduled email:', error)
      }
    },
    delayMinutes * 60 * 1000,
  )
}

/**
 * Log sent email to audit log
 */
async function logEmailSent({
  payload,
  templateId,
  organizationId,
  recipientEmail,
  triggerEvent,
  variables,
  templateName,
  templateSubject,
  htmlContent,
  textContent,
}: {
  payload: Payload
  templateId: string | number
  organizationId: string | number
  recipientEmail: string
  triggerEvent: string
  variables: Record<string, any>
  templateName?: string
  templateSubject?: string
  htmlContent?: string
  textContent?: string
}): Promise<void> {
  try {
    // Fetch template details if not provided
    let name = templateName
    let subject = templateSubject

    if (!name || !subject) {
      const template = await payload.findByID({
        collection: 'email-templates',
        id: templateId,
      })
      name = template.name
      subject = template.subject
    }

    // Fetch organization for email config
    const organization = await payload.findByID({
      collection: 'organizations',
      id: organizationId,
    })
    const emailConfig = organization.emailConfig
    const fromEmail = emailConfig?.fromEmail || 'noreply@example.com'
    const fromName = emailConfig?.senderName || organization.name

    await payload.create({
      collection: 'email-logs',
      data: {
        direction: 'outbound',
        subject: subject,
        fromEmail,
        fromName,
        toEmail: recipientEmail,
        template: templateId as any,
        templateName: name,
        templateSubject: subject,
        organization: organizationId as any,
        recipientEmail,
        triggerEvent: triggerEvent as any,
        variables: JSON.stringify(variables),
        sentAt: new Date().toISOString(),
        status: 'sent',
        htmlContent,
        textContent,
      },
    })
  } catch (error) {
    console.error('❌ Error logging email:', error)
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Helper to extract variables from a data object based on template
 */
export function extractVariablesFromData(
  data: Record<string, any>,
  availableVariables?: string,
): Record<string, any> {
  if (!availableVariables) {
    return data
  }

  const varList = availableVariables
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)

  const variables: Record<string, any> = {}

  for (const varName of varList) {
    if (varName in data) {
      variables[varName] = data[varName]
    }
  }

  return variables
}
