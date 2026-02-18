import { NextRequest, NextResponse } from 'next/server'
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
 * Generate email template content using OpenAI
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

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.',
        },
        { status: 500 },
      )
    }

    // Call OpenAI API with streaming
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
            content: EMAIL_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()

      try {
        const errorJson = JSON.parse(error)
        return NextResponse.json(
          { error: errorJson.error?.message || 'Failed to generate content from OpenAI' },
          { status: response.status },
        )
      } catch (parseErr) {
        return NextResponse.json(
          { error: `OpenAI API error: ${error.substring(0, 200)}` },
          { status: response.status },
        )
      }
    }

    // Return streaming response
    // Transform OpenAI SSE stream to plain text stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.close()
          return
        }

        try {
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              controller.close()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk

            // Split by newlines but keep incomplete lines in buffer
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep last incomplete line in buffer

            for (const line of lines) {
              if (line.trim() === '') continue

              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()

                if (data === '[DONE]') {
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content))
                  }
                } catch (e) {
                  // Skip invalid JSON - likely a partial chunk
                }
              }
            }
          }
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
