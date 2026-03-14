'use client'

import { useState, useCallback } from 'react'
import type { TriggerEvent } from '@/services/emailAutomation'

interface GenerateEmailParams {
  subject?: string
  triggerEvent?: TriggerEvent | 'none'
  description?: string
  tenantName?: string
}

interface UseEmailGenerationReturn {
  /** The generated email content (streaming) */
  content: string
  /** Whether generation is in progress */
  isGenerating: boolean
  /** Error message if generation failed */
  error: string | null
  /** Function to start generating email content */
  generate: (params: GenerateEmailParams) => Promise<void>
  /** Function to stop ongoing generation */
  stop: () => void
  /** Function to reset the state */
  reset: () => void
}

/**
 * Hook for generating email content using AI streaming
 *
 * @example
 * ```tsx
 * const { content, isGenerating, error, generate } = useEmailGeneration()
 *
 * // Generate email
 * await generate({
 *   subject: 'Welcome Email',
 *   triggerEvent: 'participant.created',
 *   tenantName: 'My Organization'
 * })
 * ```
 */
export function useEmailGeneration(): UseEmailGenerationReturn {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsGenerating(false)
    }
  }, [abortController])

  const reset = useCallback(() => {
    setContent('')
    setError(null)
    setIsGenerating(false)
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
  }, [abortController])

  const generate = useCallback(async (params: GenerateEmailParams) => {
    // Reset state
    setContent('')
    setError(null)
    setIsGenerating(true)

    // Create new abort controller
    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch('/api/generate-email-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate content (${response.status})`)
      }

      // Check if response has a body
      if (!response.body) {
        throw new Error('No response body')
      }

      // Read the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode and append the chunk
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Update content with accumulated buffer for real-time streaming
        setContent(buffer)
      }

      setIsGenerating(false)
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      setError(err instanceof Error ? err.message : 'Failed to generate content')
      setIsGenerating(false)
    } finally {
      setAbortController(null)
    }
  }, [])

  return {
    content,
    isGenerating,
    error,
    generate,
    stop,
    reset,
  }
}
