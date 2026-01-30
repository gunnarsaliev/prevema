import type { Participant, Partner } from '@/payload-types'

export type SocialPlatform = 'generic' | 'linkedin' | 'twitter' | 'facebook' | 'instagram'

interface GenerateSocialPostParams {
  platform?: SocialPlatform
  participantData?: Partial<Participant>
  partnerData?: Partial<Partner>
  eventName?: string
  eventDescription?: string
  eventWhy?: string
  eventWhat?: string
  eventWhere?: string
  eventWho?: string
  eventTheme?: string
}

interface AllPlatformPosts {
  linkedin: string
  twitter: string
  facebook: string
  instagram: string
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

/**
 * Generate social media posts for all platforms simultaneously
 */
export async function generateAllPlatformPosts(
  params: Omit<GenerateSocialPostParams, 'platform'>,
): Promise<AllPlatformPosts> {
  const platforms: SocialPlatform[] = ['linkedin', 'twitter', 'facebook', 'instagram']

  try {
    // Generate all platform posts in parallel
    const [linkedin, twitter, facebook, instagram] = await Promise.all(
      platforms.map((platform) =>
        generateSocialPost({
          ...params,
          platform,
        }),
      ),
    )

    return {
      linkedin,
      twitter,
      facebook,
      instagram,
    }
  } catch (error) {
    console.error('Error generating all platform posts:', error)
    throw error
  }
}

/**
 * Generate social media post copy using OpenAI
 */
export async function generateSocialPost(
  params: GenerateSocialPostParams,
): Promise<string> {
  const { platform = 'generic', participantData, partnerData, eventName, eventDescription, eventWhy, eventWhat, eventWhere, eventWho, eventTheme } = params

  // Build the prompt based on whether it's a participant or partner
  const prompt = participantData
    ? buildParticipantPrompt(participantData, eventName, eventDescription, platform, eventWhy, eventWhat, eventWhere, eventWho, eventTheme)
    : buildPartnerPrompt(partnerData!, eventName, eventDescription, platform, eventWhy, eventWhat, eventWhere, eventWho, eventTheme)

  // Get OpenAI API key from environment
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert social media copywriter specializing in authentic, first-person announcements. Generate engaging posts written from the perspective of the person or company announcing they are joining an event. Write in a genuine, conversational tone that expresses excitement and anticipation. Never use hashtags, keep emojis minimal and natural, and avoid promotional language.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = (await response.json()) as OpenAIResponse
    const generatedContent = data.choices?.[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated from OpenAI')
    }

    return generatedContent.trim()
  } catch (error) {
    console.error('Error generating social post:', error)
    throw error
  }
}

/**
 * Build prompt for participant social post
 */
function buildParticipantPrompt(
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

  // Build comprehensive context with ALL available data
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
    contextParts.push(`Social Links: ${participant.socialLinks.map(link => `${link.platform}: ${link.url}`).join(', ')}`)
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

/**
 * Build prompt for partner social post
 */
function buildPartnerPrompt(
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

  // Build comprehensive context with ALL available data
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
    contextParts.push(`Social Links: ${partner.socialLinks.map(link => `${link.platform}: ${link.url}`).join(', ')}`)
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

/**
 * Get platform-specific guidelines
 */
function getPlatformGuidelines(platform: SocialPlatform): string {
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
