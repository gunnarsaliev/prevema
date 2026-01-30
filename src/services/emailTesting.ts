import type { Payload } from 'payload'
import type { EmailTemplate } from '@/payload-types'
import { extractHandlebarsVariables } from '@/services/emailValidation.server'
import { lexicalToHtml } from '@/utils/lexicalToHtml'
import { compileTemplate, extractTemplateVariables } from '@/utils/templateEngine'

/**
 * Preview email template with sample data
 */
export function previewEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, any>,
): { subject: string; html: string; missingVariables: string[] } {
  // Convert Lexical richText to HTML string
  const htmlBodyString = lexicalToHtml(template.htmlBody)

  // Use CSP-safe template engine instead of Handlebars
  const subject = compileTemplate(template.subject, variables)
  const html = compileTemplate(htmlBodyString, variables)

  // Extract required variables from the template content itself
  const subjectVariables = extractTemplateVariables(template.subject)
  const bodyVariables = extractTemplateVariables(htmlBodyString)
  const requiredVariables = [...new Set([...subjectVariables, ...bodyVariables])]

  const providedVariables = Object.keys(variables)
  const missingVariables = requiredVariables.filter((v: string) => !providedVariables.includes(v))

  return { subject, html, missingVariables }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail({
  payload,
  tenantId,
  templateId,
  testEmail,
  testVariables,
}: {
  payload: Payload
  tenantId: string
  templateId: string
  testEmail: string
  testVariables: Record<string, any>
}): Promise<{ success: boolean; error?: string; preview?: { subject: string; html: string } }> {
  try {
    // Fetch template
    const template = await payload.findByID({
      collection: 'email-templates',
      id: templateId,
    })

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    // Verify team matches
    const templateTeamId = typeof template.team === 'object' ? template.team.id : template.team
    if (String(templateTeamId) !== String(tenantId)) {
      return { success: false, error: 'Template does not belong to this team' }
    }

    // Generate preview
    const preview = previewEmailTemplate(template, testVariables)

    if (preview.missingVariables.length > 0) {
      return {
        success: false,
        error: `Missing variables: ${preview.missingVariables.join(', ')}`,
        preview,
      }
    }

    // Fetch team to get email config
    const team = await payload.findByID({
      collection: 'organizations',
      id: tenantId,
    })

    if (!team) {
      return { success: false, error: 'Team not found' }
    }

    // Get email config
    const emailConfig = (team as any).emailConfig as any

    // Send test email
    await payload.sendEmail({
      to: testEmail,
      subject: `[TEST] ${preview.subject}`,
      html: `
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
          <strong>⚠️ This is a test email</strong>
          <p style="margin: 0.5rem 0 0 0; font-size: 14px;">
            Template: ${template.name}<br/>
            Team: ${typeof team === 'object' ? team.name : 'Unknown'}
          </p>
        </div>
        ${preview.html}
      `,
      from:
        emailConfig?.isActive && emailConfig?.fromEmail
          ? `${emailConfig.senderName || 'Test'} <${emailConfig.fromEmail}>`
          : undefined,
      replyTo: emailConfig?.isActive && emailConfig?.replyToEmail ? emailConfig.replyToEmail : undefined,
    })

    return { success: true, preview }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Check for common Resend errors and provide helpful messages
    let userFriendlyError = errorMessage

    if (errorMessage.includes('domain is not verified')) {
      const domainMatch = errorMessage.match(/The ([\w.-]+) domain is not verified/)
      const domain = domainMatch ? domainMatch[1] : 'your domain'
      userFriendlyError = `Domain not verified: ${domain}. Please verify your domain at https://resend.com/domains or use a verified domain in your "From Email" field.`
    } else if (errorMessage.includes('403') || errorMessage.includes('validation_error')) {
      userFriendlyError = `Resend validation error: ${errorMessage}. Check your API key and domain verification at https://resend.com`
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      userFriendlyError = 'Invalid API key. Please check your Resend API key in tenant settings.'
    } else if (errorMessage.includes('rate_limit')) {
      userFriendlyError = 'Rate limit exceeded. Please wait a moment and try again.'
    }

    return { success: false, error: userFriendlyError }
  }
}

/**
 * Generate sample variables for a template
 */
export function generateSampleVariables(template: EmailTemplate): Record<string, string> {
  // Extract variables from template content
  const htmlBodyString = lexicalToHtml(template.htmlBody)
  const subjectVariables = extractTemplateVariables(template.subject)
  const bodyVariables = extractTemplateVariables(htmlBodyString)
  const variables = [...new Set([...subjectVariables, ...bodyVariables])]

  console.log('📋 Extracted variables from template:', variables)

  if (variables.length === 0) {
    console.warn('⚠️ No variables found in template')
    return {}
  }

  const sampleData: Record<string, string> = {}

  variables.forEach((variable: string) => {
    // Generate appropriate sample data based on variable name
    const lowerVar = variable.toLowerCase()

    if (lowerVar.includes('name')) {
      sampleData[variable] = 'John Doe'
    } else if (lowerVar.includes('email')) {
      sampleData[variable] = 'test@example.com'
    } else if (lowerVar.includes('link') || lowerVar.includes('url')) {
      sampleData[variable] = 'https://example.com/sample-link'
    } else if (lowerVar.includes('date')) {
      sampleData[variable] = new Date().toLocaleDateString()
    } else if (lowerVar.includes('tenant')) {
      sampleData[variable] = 'Sample Organization'
    } else if (lowerVar.includes('event')) {
      sampleData[variable] = 'Tech Conference 2024'
    } else if (lowerVar.includes('role')) {
      sampleData[variable] = 'Editor'
    } else if (variable === 'socialPostLinkedIn') {
      sampleData[variable] = 'Excited to announce John Doe as our keynote speaker at Tech Conference 2024! Join us to hear insights on innovation and technology. #TechConference #Innovation'
    } else if (variable === 'socialPostTwitter') {
      sampleData[variable] = '🎤 Keynote speaker alert! John Doe joins us at Tech Conference 2024. Don\'t miss out! Register now 👉 [link] #TechConf2024'
    } else if (variable === 'socialPostFacebook') {
      sampleData[variable] = '🎉 We\'re thrilled to announce John Doe as a featured speaker at Tech Conference 2024! With years of experience in technology and innovation, John will share valuable insights. Mark your calendars!'
    } else if (variable === 'socialPostInstagram') {
      sampleData[variable] = '✨ Meet our speaker John Doe! 🎤 Industry expert joining Tech Conference 2024 📅 Don\'t miss it! Link in bio 🔗 #TechConf #SpeakerAnnouncement'
    } else if (variable === 'socialPostGeneratedAt') {
      sampleData[variable] = new Date().toLocaleDateString()
    } else {
      sampleData[variable] = `Sample ${variable}`
    }
  })

  return sampleData
}

/**
 * Validate that all required fields are present for email sending
 */
export function validateEmailReadiness(
  tenant: any,
  template: EmailTemplate,
): { ready: boolean; issues: string[] } {
  const issues: string[] = []

  // Check if template is active
  if (!template.isActive) {
    issues.push('Template is not active')
  }

  // Check if tenant has email config (optional, but validate if active)
  const emailConfig = tenant.emailConfig
  if (emailConfig?.isActive) {
    if (!emailConfig.resendApiKey || !emailConfig.resendApiKey.startsWith('re_')) {
      issues.push('Invalid or missing Resend API key in tenant configuration')
    }

    if (!emailConfig.fromEmail) {
      issues.push('Missing from email address in tenant configuration')
    }
  }

  // Check if template has required fields
  if (!template.subject || template.subject.trim() === '') {
    issues.push('Template subject is empty')
  }

  if (!template.htmlBody) {
    issues.push('Template body is empty')
  }

  return { ready: issues.length === 0, issues }
}
