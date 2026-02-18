import { getAvailableVariables, formatVariableReference } from '@/services/emailVariables'
import type { TriggerEvent } from '@/services/emailAutomation'
import type { Participant, Partner } from '@/payload-types'

// ─────────────────────────────────────────────────────────────────────────────
// Social post prompts
// ─────────────────────────────────────────────────────────────────────────────

export type SocialPlatform = 'generic' | 'linkedin' | 'twitter' | 'facebook' | 'instagram'

export const SOCIAL_POST_SYSTEM_PROMPT =
  'You are an expert social media copywriter specializing in authentic, first-person announcements. Generate engaging posts written from the perspective of the person or company announcing they are joining an event. Write in a genuine, conversational tone that expresses excitement and anticipation. Never use hashtags, keep emojis minimal and natural, and avoid promotional language.'

export function getPlatformGuidelines(platform: SocialPlatform): string {
  switch (platform) {
    case 'linkedin':
      return `Platform: LinkedIn
Character limit: Keep it under 1300 characters (aim for 150-300 for best engagement)
Style: Professional, warm, introduction-focused
Tone: Welcome and introduce people in a genuine way
Hashtags: DO NOT use hashtags`

    case 'twitter':
      return `Platform: Twitter/X
Character limit: 280 characters MAXIMUM (be concise!)
Style: Conversational, welcoming, direct
Tone: Warm introduction that makes people excited to learn about who's joining
Hashtags: DO NOT use hashtags`

    case 'facebook':
      return `Platform: Facebook
Character limit: 400-500 characters is ideal
Style: Warm, welcoming, introduction-focused
Format: Focus on introducing the person or partner in a genuine way
- Begin with a warm welcome (e.g., "We're excited to introduce...")
- Share their background and what makes them special
- Use multiple short paragraphs for readability
- End with genuine excitement about having them at the event
Emojis: Use minimally and naturally - only if it feels organic
Hashtags: DO NOT use hashtags`

    case 'instagram':
      return `Platform: Instagram
Character limit: 400-500 characters (can go longer but keep engaging)
Style: Warm, visual, introduction-focused
Format: Introduce the person or partner in an authentic way
- Start with a genuine welcome
- Share their story and credentials
- Use line breaks for readability
- End with excitement about having them join
Emojis: Use sparingly and only when natural - focus on authentic copy
Hashtags: DO NOT use hashtags`

    default:
      return `Platform: Generic social media
Character limit: Keep it under 300 characters
Style: Warm, welcoming, genuine introductions
Tone: Focus on introducing who is joining the event
Hashtags: DO NOT use hashtags`
  }
}

export function buildParticipantPrompt(
  participant: Partial<Participant>,
  eventName?: string,
  eventDescription?: string,
  platform: SocialPlatform = 'generic',
  eventWhy?: string,
  eventWhat?: string,
  eventWhere?: string,
  eventWho?: string,
  eventTheme?: string,
): string {
  const platformGuidelines = getPlatformGuidelines(platform)

  const contextParts = []

  contextParts.push('=== PARTICIPANT DETAILS ===')
  contextParts.push(`Name: ${participant.name || 'N/A'}`)
  contextParts.push(`Email: ${participant.email || 'N/A'}`)
  contextParts.push(`Company Name: ${participant.companyName || 'N/A'}`)
  contextParts.push(`Company Position: ${participant.companyPosition || 'N/A'}`)
  contextParts.push(`Company Website: ${participant.companyWebsite || 'N/A'}`)
  contextParts.push(`Biography: ${participant.biography || 'N/A'}`)
  contextParts.push(`Country: ${participant.country || 'N/A'}`)
  contextParts.push(`Phone Number: ${participant.phoneNumber || 'N/A'}`)
  contextParts.push(`Presentation Topic: ${participant.presentationTopic || 'N/A'}`)
  contextParts.push(`Presentation Summary: ${participant.presentationSummary || 'N/A'}`)
  contextParts.push(`Technical Requirements: ${participant.technicalRequirements || 'N/A'}`)

  if (participant.socialLinks && participant.socialLinks.length > 0) {
    contextParts.push(
      `Social Links: ${participant.socialLinks.map((link) => `${link.platform}: ${link.url}`).join(', ')}`,
    )
  } else {
    contextParts.push(`Social Links: N/A`)
  }

  contextParts.push('')
  contextParts.push('=== EVENT DETAILS ===')
  contextParts.push(`Event Name: ${eventName || 'N/A'}`)
  contextParts.push(`Event Description: ${eventDescription || 'N/A'}`)
  contextParts.push(`Event Purpose (Why): ${eventWhy || 'N/A'}`)
  contextParts.push(`Event Topics (What): ${eventWhat || 'N/A'}`)
  contextParts.push(`Event Location (Where): ${eventWhere || 'N/A'}`)
  contextParts.push(`Target Audience (Who): ${eventWho || 'N/A'}`)
  contextParts.push(`Event Theme: ${eventTheme || 'N/A'}`)

  const context = contextParts.join('\n')

  return `Generate a compelling first-person social media post for ${platform === 'generic' ? 'social media' : platform} where a speaker/participant announces they are joining an event.

Context:
${context}

${platformGuidelines}

Requirements:
- Write in FIRST PERSON from the participant's perspective (use "I", "my", "I'm")
- Start with excitement about joining the event (e.g., "I'm excited to join...", "Thrilled to announce I'll be joining...")
- USE ALL PROVIDED DATA from both participant and event details to create rich, informative content
- Reference specific event details (purpose, topics, location, audience) when available
- Mention their presentation topic and what they'll be sharing if provided
- Include their background, company, and position naturally in the narrative
- Share why this specific event aligns with their expertise and interests
- Create multiple short paragraphs for easy reading
- Keep it personal, genuine, and conversational
- End with anticipation or looking forward to the event
- DO NOT use any hashtags
- Keep emojis minimal and natural (avoid forced emoji placement)
- Make it feel authentic, not promotional
- Draw from ALL available context to make the post specific and compelling

Example structure:
I'm excited to join [Event Name]!

[Why this event matters to them or what they're looking forward to]

[Brief mention of what they'll be sharing or discussing]

Looking forward to connecting with everyone there!

Generate ONLY the post copy, no additional commentary or formatting.`
}

export function buildPartnerPrompt(
  partner: Partial<Partner>,
  eventName?: string,
  eventDescription?: string,
  platform: SocialPlatform = 'generic',
  eventWhy?: string,
  eventWhat?: string,
  eventWhere?: string,
  eventWho?: string,
  eventTheme?: string,
): string {
  const platformGuidelines = getPlatformGuidelines(platform)

  const contextParts = []

  contextParts.push('=== PARTNER DETAILS ===')
  contextParts.push(`Company Name: ${partner.companyName || 'N/A'}`)
  contextParts.push(`Contact Person: ${partner.contactPerson || 'N/A'}`)
  contextParts.push(`Contact Email: ${partner.contactEmail || 'N/A'}`)
  contextParts.push(`Company Email: ${partner.email || 'N/A'}`)
  contextParts.push(`Field of Expertise: ${partner.fieldOfExpertise || 'N/A'}`)
  contextParts.push(`Company Website: ${partner.companyWebsiteUrl || 'N/A'}`)
  contextParts.push(`Company Description: ${partner.companyDescription || 'N/A'}`)
  contextParts.push(`Sponsorship Level: ${partner.sponsorshipLevel || 'N/A'}`)
  contextParts.push(`Additional Notes: ${partner.additionalNotes || 'N/A'}`)

  if (partner.socialLinks && partner.socialLinks.length > 0) {
    contextParts.push(
      `Social Links: ${partner.socialLinks.map((link) => `${link.platform}: ${link.url}`).join(', ')}`,
    )
  } else {
    contextParts.push(`Social Links: N/A`)
  }

  contextParts.push('')
  contextParts.push('=== EVENT DETAILS ===')
  contextParts.push(`Event Name: ${eventName || 'N/A'}`)
  contextParts.push(`Event Description: ${eventDescription || 'N/A'}`)
  contextParts.push(`Event Purpose (Why): ${eventWhy || 'N/A'}`)
  contextParts.push(`Event Topics (What): ${eventWhat || 'N/A'}`)
  contextParts.push(`Event Location (Where): ${eventWhere || 'N/A'}`)
  contextParts.push(`Target Audience (Who): ${eventWho || 'N/A'}`)
  contextParts.push(`Event Theme: ${eventTheme || 'N/A'}`)

  const context = contextParts.join('\n')

  return `Generate a compelling first-person social media post for ${platform === 'generic' ? 'social media' : platform} where a partner company announces they are joining an event.

Context:
${context}

${platformGuidelines}

Requirements:
- Write in FIRST PERSON from the company's perspective (use "We", "our", "we're")
- Start with excitement about joining/partnering with the event (e.g., "We're excited to partner with...", "Thrilled to join...")
- USE ALL PROVIDED DATA from both partner and event details to create rich, informative content
- Reference specific event details (purpose, topics, location, audience) when available
- Mention their field of expertise and how it connects to the event's focus
- Include their company description and what they do naturally in the narrative
- Share why this specific event aligns with their mission, values, or expertise
- Highlight the partnership level if provided (sponsor, partner, etc.)
- Create multiple short paragraphs for easy reading
- Keep it genuine, collaborative, and conversational
- End with anticipation or looking forward to the event
- DO NOT use any hashtags
- Keep emojis minimal and natural (avoid forced emoji placement)
- Make it feel authentic and partnership-focused, not promotional
- Draw from ALL available context to make the post specific and compelling

Example structure:
We're thrilled to partner with [Event Name]!

[Why this partnership is meaningful or what resonates with their mission]

[Brief mention of what they do and how it connects to the event]

Looking forward to being part of this amazing event!

Generate ONLY the post copy, no additional commentary or formatting.`
}

// ─────────────────────────────────────────────────────────────────────────────
// Email content prompts
// ─────────────────────────────────────────────────────────────────────────────

export const EMAIL_SYSTEM_PROMPT =
  'You are an expert email copywriter. Generate professional, engaging email content in HTML format with Handlebars variable placeholders.'

export function buildEmailPrompt(params: {
  subject?: string
  description?: string
  tenantName?: string
  triggerEvent?: TriggerEvent | 'none'
  variableReference?: string
  variableGroups?: ReturnType<typeof getAvailableVariables>
}): string {
  const { subject, description, tenantName, triggerEvent } = params

  const variableReference =
    params.variableReference ?? formatVariableReference(triggerEvent || 'none')

  let contextDescription = ''
  if (triggerEvent === 'participant.created') {
    contextDescription =
      'This is for when a new participant registers for an event. The email should welcome them and provide relevant event information.'
  } else if (triggerEvent === 'participant.updated') {
    contextDescription =
      'This is for notifying participants about status changes (approval, need more info, etc.). Focus on the status update and next steps.'
  } else if (triggerEvent === 'partner.invited') {
    contextDescription =
      'This is for inviting potential partners or sponsors. Focus on partnership opportunities and benefits.'
  } else if (triggerEvent === 'event.published') {
    contextDescription = 'This is for announcing a published event to relevant recipients.'
  }

  return `Generate professional email template content in HTML format for an event management system.

## Context:
${subject ? `- Subject: ${subject}` : ''}
${description ? `- Purpose: ${description}` : ''}
${tenantName ? `- Organization: ${tenantName}` : ''}
${triggerEvent && triggerEvent !== 'none' ? `- Trigger Event: ${triggerEvent}` : ''}
${contextDescription ? `- Context: ${contextDescription}` : ''}

## Available Variables:
${variableReference}

## CRITICAL REQUIREMENTS:
1. **DO NOT include any links (<a> tags) in the email**
2. **DO NOT include any email addresses** (the system will use {{email}} variable when needed)
3. **DO NOT use placeholder text like:**
   - support@example.com
   - contact@organization.com
   - info@company.com
   - https://example.com
   - [Insert Link Here]
   - Any other placeholder or example URLs/emails

4. Write the email body content in clean, semantic HTML
5. Use appropriate Handlebars variables ({{variableName}}) throughout the content based on the available variables
6. Include:
   - Warm, professional greeting using {{name}} if available
   - Clear, engaging body text relevant to the context and trigger event
   - Specific information using variables like {{event}}, {{status}}, {{companyName}}, etc.
   - Professional sign-off using {{tenantName}} if appropriate
7. Structure:
   - Use <h2> for section headings if needed (avoid <h1>)
   - Use <p> for paragraphs
   - Use <strong> and <em> for emphasis
   - DO NOT use <a> tags
8. Make it personal and engaging by using the provided variables
9. Keep it concise but informative (3-5 short paragraphs)
10. Maintain professional tone appropriate for ${triggerEvent || 'general'} communication
11. Focus on the actual context provided - if this is about participant approval, talk about approval; if it's about registration, welcome them, etc.

## Output Format:
Return ONLY the HTML content, no markdown code blocks, no explanations, no placeholder links or emails.
Start directly with HTML tags.`
}
