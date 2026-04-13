import type { Payload } from 'payload'
import type { EmailTemplate } from '@/payload-types'
import { Resend } from 'resend'
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
 * Organization-Level Email Service
 *
 * This service handles emails triggered WITHIN the platform by organizations,
 * such as participant notifications, event updates, etc.
 *
 * Key Features:
 * - REQUIRES organization-specific Resend API keys to be configured
 * - Uses custom email templates from the EmailTemplates collection
 * - Sends emails directly via Resend SDK using organization's API key
 *
 * IMPORTANT: Organizations MUST have active emailConfig with valid resendApiKey.
 * There is NO fallback to system email for organization-triggered emails.
 *
 * NOTE: System emails (password reset, invitations) use the global Resend adapter
 * configured in payload.config.ts, NOT this service.
 *
 * Send an email using an organization's custom template and email configuration
 */
export async function sendTenantEmail({
  payload,
  tenantId,
  templateName,
  to,
  variables,
}: SendEmailOptions): Promise<{
  success: boolean
  error?: string
  htmlContent?: string
  textContent?: string
}> {
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

    // Validate that organization has active custom email configuration
    if (!emailConfig?.isActive) {
      throw new Error(
        `Organization "${organization.name}" (ID: ${tenantId}) does not have an active email configuration. ` +
          `Please enable custom email configuration in Organization settings.`,
      )
    }

    if (!emailConfig.resendApiKey) {
      throw new Error(
        `Organization "${organization.name}" (ID: ${tenantId}) is missing Resend API key. ` +
          `Please add a valid Resend API key in Organization settings.`,
      )
    }

    if (!emailConfig.fromEmail) {
      throw new Error(
        `Organization "${organization.name}" (ID: ${tenantId}) is missing "From Email" address. ` +
          `Please configure the from email address in Organization settings.`,
      )
    }

    // Create Resend instance with organization's API key
    const resend = new Resend(emailConfig.resendApiKey)

    // Prepare from address
    const fromAddress = emailConfig.senderName
      ? `${emailConfig.senderName} <${emailConfig.fromEmail}>`
      : emailConfig.fromEmail

    // Send the email using organization's Resend account
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      replyTo: emailConfig.replyToEmail || undefined,
    })

    if (!result.data) {
      throw new Error(`Resend API error: ${result.error?.message || 'Unknown error sending email'}`)
    }

    console.log(
      `✅ Email sent successfully to ${to} using template: ${templateName} (Resend ID: ${result.data.id})`,
    )

    // Generate plain text from HTML by stripping tags
    const textContent = html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return { success: true, htmlContent: html, textContent }
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

    // Validate that organization has active custom email configuration
    if (!emailConfig?.isActive) {
      throw new Error(
        `Organization "${organization.name}" (ID: ${tenantId}) does not have an active email configuration. ` +
          `Please enable custom email configuration in Organization settings.`,
      )
    }

    if (!emailConfig.resendApiKey) {
      throw new Error(
        `Organization "${organization.name}" (ID: ${tenantId}) is missing Resend API key. ` +
          `Please add a valid Resend API key in Organization settings.`,
      )
    }

    if (!emailConfig.fromEmail) {
      throw new Error(
        `Organization "${organization.name}" (ID: ${tenantId}) is missing "From Email" address. ` +
          `Please configure the from email address in Organization settings.`,
      )
    }

    // Create Resend instance with organization's API key
    const resend = new Resend(emailConfig.resendApiKey)

    // Prepare from address
    const fromAddress = emailConfig.senderName
      ? `${emailConfig.senderName} <${emailConfig.fromEmail}>`
      : emailConfig.fromEmail

    // Send the email using organization's Resend account
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      replyTo: emailConfig.replyToEmail || undefined,
    })

    if (!result.data) {
      throw new Error(`Resend API error: ${result.error?.message || 'Unknown error sending email'}`)
    }

    console.log(`✅ Email sent successfully to ${to} (Resend ID: ${result.data.id})`)

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
