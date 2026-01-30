import { NextRequest, NextResponse } from 'next/server'
import { generateSocialPost, generateAllPlatformPosts, SocialPlatform } from '@/services/socialPostGeneration'

interface GenerateSocialPostRequest {
  type: 'participant' | 'partner'
  mode?: 'all' | 'single'
  platform?: SocialPlatform
  participantData?: any
  partnerData?: any
  eventName?: string
  eventDescription?: string
  eventWhy?: string
  eventWhat?: string
  eventWhere?: string
  eventWho?: string
  eventTheme?: string
}

/**
 * POST /api/generate-social-post
 * Generate social media post copy using OpenAI
 * Supports generating all platforms at once or a single platform
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateSocialPostRequest
    const { type, mode = 'all', platform, participantData, partnerData, eventName, eventDescription, eventWhy, eventWhat, eventWhere, eventWho, eventTheme } = body

    // Validate request
    if (!type || (type !== 'participant' && type !== 'partner')) {
      return NextResponse.json({ error: 'Invalid type. Must be "participant" or "partner"' }, { status: 400 })
    }

    if (type === 'participant' && !participantData) {
      return NextResponse.json({ error: 'participantData is required for participant type' }, { status: 400 })
    }

    if (type === 'partner' && !partnerData) {
      return NextResponse.json({ error: 'partnerData is required for partner type' }, { status: 400 })
    }

    if (mode === 'single' && !platform) {
      return NextResponse.json({ error: 'platform is required when mode is "single"' }, { status: 400 })
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 500 }
      )
    }

    const generatedAt = new Date().toISOString()

    // Generate all platforms or single platform
    if (mode === 'all') {
      const posts = await generateAllPlatformPosts({
        participantData: type === 'participant' ? participantData : undefined,
        partnerData: type === 'partner' ? partnerData : undefined,
        eventName,
        eventDescription,
        eventWhy,
        eventWhat,
        eventWhere,
        eventWho,
        eventTheme,
      })

      return NextResponse.json({
        success: true,
        posts,
        generatedAt,
      })
    } else {
      // Single platform generation
      const socialPostCopy = await generateSocialPost({
        platform: platform || 'generic',
        participantData: type === 'participant' ? participantData : undefined,
        partnerData: type === 'partner' ? partnerData : undefined,
        eventName,
        eventDescription,
        eventWhy,
        eventWhat,
        eventWhere,
        eventWho,
        eventTheme,
      })

      return NextResponse.json({
        success: true,
        socialPostCopy,
        platform,
        generatedAt,
      })
    }
  } catch (error) {
    console.error('Error generating social post:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate social post',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
