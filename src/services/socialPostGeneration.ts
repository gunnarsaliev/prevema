import type { Participant, Partner } from '@/payload-types'
import {
  SOCIAL_POST_SYSTEM_PROMPT,
  buildParticipantPrompt,
  buildPartnerPrompt,
  type SocialPlatform,
} from '@/lib/prompts'

export type { SocialPlatform } from '@/lib/prompts'

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
  const platforms: SocialPlatform[] = [
    'linkedin',
    'twitter',
    'facebook',
    'instagram',
  ]

  try {
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
export async function generateSocialPost(params: GenerateSocialPostParams): Promise<string> {
  const {
    platform = 'generic',
    participantData,
    partnerData,
    eventName,
    eventDescription,
    eventWhy,
    eventWhat,
    eventWhere,
    eventWho,
    eventTheme,
  } = params

  const prompt = participantData
    ? buildParticipantPrompt(
        participantData,
        eventName,
        eventDescription,
        platform,
        eventWhy,
        eventWhat,
        eventWhere,
        eventWho,
        eventTheme,
      )
    : buildPartnerPrompt(
        partnerData!,
        eventName,
        eventDescription,
        platform,
        eventWhy,
        eventWhat,
        eventWhere,
        eventWho,
        eventTheme,
      )

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
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
            content: SOCIAL_POST_SYSTEM_PROMPT,
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
