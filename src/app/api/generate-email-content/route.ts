import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getAvailableVariables, formatVariableReference } from '@/services/emailVariables'
import type { TriggerEvent } from '@/services/emailAutomation'
import { EMAIL_SYSTEM_PROMPT, buildEmailPrompt } from '@/lib/prompts'

interface GenerateEmailContentRequest {
  subject?: string
  triggerEvent?: TriggerEvent | 'none'
  description?: string
  tenantName?: string
}

/**
 * POST /api/generate-email-content
 * Generate email template content using OpenAI with Vercel AI SDK
 * Streams the response for better UX
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateEmailContentRequest
    const { subject, triggerEvent, description, tenantName } = body

    // Get available variables for the trigger event
    const variableGroups = getAvailableVariables(triggerEvent || 'none')
    const variableReference = formatVariableReference(triggerEvent || 'none')

    // Build comprehensive prompt
    const prompt = buildEmailPrompt({
      subject,
      description,
      tenantName,
      triggerEvent,
      variableReference,
      variableGroups,
    })

    // Generate streaming response using Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: EMAIL_SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // Return the text stream as plain text
    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
