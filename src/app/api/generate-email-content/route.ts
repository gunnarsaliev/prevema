import { NextRequest, NextResponse } from 'next/server'
import { getAvailableVariables, formatVariableReference } from '@/services/emailVariables'
import type { TriggerEvent } from '@/services/emailAutomation'

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
    const prompt = buildPrompt({
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
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 500 }
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
            content:
              'You are an expert email copywriter. Generate professional, engaging email content in HTML format with Handlebars variable placeholders.',
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

      // Parse error for better reporting
      try {
        const errorJson = JSON.parse(error)
        return NextResponse.json(
          { error: errorJson.error?.message || 'Failed to generate content from OpenAI' },
          { status: response.status }
        )
      } catch (parseErr) {
        return NextResponse.json(
          { error: `OpenAI API error: ${error.substring(0, 200)}` },
          { status: response.status }
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
      { status: 500 }
    )
  }
}

/**
 * Build the prompt for OpenAI
 */
function buildPrompt(params: {
  subject?: string
  description?: string
  tenantName?: string
  triggerEvent?: string
  variableReference: string
  variableGroups: any[]
}): string {
  const { subject, description, tenantName, triggerEvent, variableReference, variableGroups } =
    params

  // Build context-aware description
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

  const prompt = `Generate professional email template content in HTML format for an event management system.

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

  return prompt
}
