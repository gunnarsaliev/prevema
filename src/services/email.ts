import type { Payload } from 'payload'
import type { EmailTemplate } from '@/payload-types'
import { lexicalToHtml } from '@/utils/lexicalToHtml'
import { compileTemplate } from '@/utils/templateEngine'

interface SendEmailOptions {
  payload: Payload
  tenantId: string
  templateName: string
  to: string
  variables: Record<string, any>
}

interface TenantEmailConfig {
  isActive?: boolean
  resendApiKey?: string
  senderName?: string
  fromEmail?: string
  replyToEmail?: string
}

/**
 * Send an email using an organization's custom template and email configuration
 */
export async function sendTenantEmail({
  payload,
  tenantId,
  templateName,
  to,
  variables,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch the organization
    const organization = await payload.findByID({
      collection: 'organizations',
      id: tenantId,
    })

    if (!organization) {
      throw new Error(`Organization not found: ${tenantId}`)
    }

    // Fetch the email template
    const templates = await payload.find({
      collection: 'email-templates',
      where: {
        and: [
          {
            organization: {
              equals: tenantId,
            },
          },
          {
            name: {
              equals: templateName,
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
        ],
      },
      limit: 1,
    })

    if (!templates.docs.length) {
      throw new Error(`Active template not found: ${templateName} for organization: ${tenantId}`)
    }

    const template = templates.docs[0]

    // Convert Lexical richText to HTML string
    const htmlBodyString = lexicalToHtml(template.htmlBody)

    console.log(`📋 Sending template "${templateName}" to ${to}`)

    // Compile the template with CSP-safe template engine
    try {
      const subject = compileTemplate(template.subject, variables)
      const html = compileTemplate(htmlBodyString, variables)

      console.log(`✅ Template compiled successfully`)

      if (!subject || !html) {
        throw new Error('Template compilation resulted in empty output')
      }
    } catch (compileError) {
      const errorMsg =
        compileError instanceof Error ? compileError.message : 'Unknown compilation error'
      console.error(`❌ Template compilation error:`, errorMsg)
      throw new Error(`Template compilation failed: ${errorMsg}`)
    }

    // Compile for actual use
    const subject = compileTemplate(template.subject, variables)
    const html = compileTemplate(htmlBodyString, variables)

    // Get organization email config
    const emailConfig = (organization as any).emailConfig as TenantEmailConfig | undefined

    // Determine which email configuration to use
    const useCustomConfig = emailConfig?.isActive && emailConfig?.resendApiKey

    // Send the email
    await payload.sendEmail({
      to,
      subject,
      html,
      from:
        useCustomConfig && emailConfig.fromEmail
          ? `${emailConfig.senderName || 'Notification'} <${emailConfig.fromEmail}>`
          : undefined, // Falls back to default
      replyTo: useCustomConfig && emailConfig.replyToEmail ? emailConfig.replyToEmail : undefined,
    })

    console.log(`✅ Email sent successfully to ${to} using template: ${templateName}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to send email:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send a simple email with organization's custom configuration (without template)
 */
export async function sendSimpleTenantEmail({
  payload,
  tenantId,
  to,
  subject,
  html,
}: {
  payload: Payload
  tenantId: string
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch the organization
    const organization = await payload.findByID({
      collection: 'organizations',
      id: tenantId,
    })

    if (!organization) {
      throw new Error(`Organization not found: ${tenantId}`)
    }

    // Get organization email config
    const emailConfig = (organization as any).emailConfig as TenantEmailConfig | undefined
    const useCustomConfig = emailConfig?.isActive && emailConfig?.resendApiKey

    // Send the email
    await payload.sendEmail({
      to,
      subject,
      html,
      from:
        useCustomConfig && emailConfig.fromEmail
          ? `${emailConfig.senderName || 'Notification'} <${emailConfig.fromEmail}>`
          : undefined,
      replyTo: useCustomConfig && emailConfig.replyToEmail ? emailConfig.replyToEmail : undefined,
    })

    console.log(`✅ Email sent successfully to ${to}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to send email:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Note: Variable validation is now handled by the predefined variable registry
 * See src/services/emailVariables.ts for available variables per trigger event
 */
