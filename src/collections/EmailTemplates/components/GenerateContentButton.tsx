'use client'

import React, { useState, useRef } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { StreamingModal } from './StreamingModal'

export const GenerateContentButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [characterCount, setCharacterCount] = useState<number>(0)
  const [showModal, setShowModal] = useState(false)
  const [isStreamComplete, setIsStreamComplete] = useState(false)

  // Refs for storing complete content
  const accumulatedContentRef = useRef<string>('')

  // Type for error response
  interface ErrorResponse {
    error?: string
    message?: string
  }

  // Get form data
  const subject = useFormFields(([fields]) => fields?.subject?.value as string)
  const description = useFormFields(([fields]) => fields?.description?.value as string)
  const triggerEvent = useFormFields(([fields]) => {
    const automationTriggers = fields?.automationTriggers?.value as any
    return automationTriggers?.triggerEvent as string
  })
  const tenant = useFormFields(([fields]) => {
    const tenantValue = fields?.tenant?.value
    // Handle both string ID and populated object
    if (typeof tenantValue === 'string') {
      return { id: tenantValue, name: undefined }
    } else if (tenantValue && typeof tenantValue === 'object') {
      return {
        id: (tenantValue as any).id,
        name: (tenantValue as any).name,
      }
    }
    return { id: undefined, name: undefined }
  })

  const canGenerate = Boolean(subject?.trim()) && Boolean(description?.trim()) && !isGenerating

  const generateContent = async () => {
    // Reset streaming state
    setIsGenerating(true)
    setStreamingContent('')
    setCharacterCount(0)
    setIsStreamComplete(false)
    accumulatedContentRef.current = ''

    try {
      const response = await fetch('/api/generate-email-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          description,
          triggerEvent: triggerEvent || 'none',
          tenantName: tenant?.name || 'Organization',
        }),
      })

      if (!response.ok) {
        // Try to get error message from server
        try {
          const errorData = (await response.json()) as ErrorResponse
          const errorMessage = errorData.error || errorData.message || 'Failed to generate content'
          throw new Error(errorMessage)
        } catch (parseErr) {
          throw new Error(`Failed to generate content (status: ${response.status})`)
        }
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let accumulatedHtml = ''

      // Read stream and update modal in real-time
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        accumulatedHtml += chunk

        // Update modal with streaming content immediately
        setStreamingContent(accumulatedHtml)
        setCharacterCount(accumulatedHtml.length)
      }

      // Stream complete
      if (accumulatedHtml.trim()) {
        accumulatedContentRef.current = accumulatedHtml
        setIsStreamComplete(true)
      } else {
        throw new Error('No content generated')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate content')
      setShowModal(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    const hasSubject = Boolean(subject?.trim())
    const hasDescription = Boolean(description?.trim())

    if (!hasSubject || !hasDescription) {
      if (!hasSubject && !hasDescription) {
        setError('Please enter a template description and email subject line first')
      } else if (!hasDescription) {
        setError('Please enter a template description first')
      } else {
        setError('Please enter an email subject line first')
      }
      return
    }

    // Open modal and start generation
    setError(null)
    setSuccess(false)
    setShowModal(true)

    await generateContent()
  }

  const handleRegenerate = async () => {
    await generateContent()
  }

  const handleAcceptContent = async () => {
    const content = accumulatedContentRef.current.trim()

    if (content) {
      try {
        // Create a ClipboardItem with both HTML and plain text formats
        // This allows rich text formatting to be preserved when pasting
        const htmlBlob = new Blob([content], { type: 'text/html' })

        // Also create plain text version by stripping HTML tags
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        const plainText = tempDiv.textContent || tempDiv.innerText || content
        const textBlob = new Blob([plainText], { type: 'text/plain' })

        const clipboardItem = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        })

        await navigator.clipboard.write([clipboardItem])

        setSuccess(true)
        setShowModal(false)

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false)
          setStreamingContent('')
          setCharacterCount(0)
        }, 3000)
      } catch (err) {
        // Fallback to plain text copy if rich text copy fails
        try {
          await navigator.clipboard.writeText(content)
          setSuccess(true)
          setShowModal(false)

          setTimeout(() => {
            setSuccess(false)
            setStreamingContent('')
            setCharacterCount(0)
          }, 3000)
        } catch (fallbackErr) {
          setError('Failed to copy content to clipboard')
          setShowModal(false)
        }
      }
    } else {
      setError('No content available to copy')
      setShowModal(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setStreamingContent('')
    setCharacterCount(0)
    setIsStreamComplete(false)
    accumulatedContentRef.current = ''
  }

  return (
    <>
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: canGenerate ? '#3b82f6' : '#9ca3af',
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'underline',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (canGenerate) {
              e.currentTarget.style.color = '#2563eb'
            }
          }}
          onMouseLeave={(e) => {
            if (canGenerate) {
              e.currentTarget.style.color = '#3b82f6'
            }
          }}
        >
          {isGenerating ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid #3b82f6',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              Generating...
            </>
          ) : (
            <>AI email generator</>
          )}
        </button>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        {!canGenerate && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--theme-elevation-600)',
              marginTop: '0.5rem',
              marginBottom: 0,
              fontStyle: 'italic',
            }}
          >
            Enter template description and email subject line to enable AI generation
          </p>
        )}

        {success && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'var(--theme-success-100)',
              border: '1px solid var(--theme-success-500)',
              borderRadius: '6px',
              fontSize: '13px',
              color: 'var(--theme-success-700)',
              fontWeight: 500,
            }}
          >
            ✅ Content copied to clipboard! You can now paste it into the HTML Body field.
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'var(--theme-error-100)',
              border: '1px solid var(--theme-error-500)',
              borderRadius: '6px',
              fontSize: '13px',
              color: 'var(--theme-error-700)',
            }}
          >
            ❌ {error}
          </div>
        )}
      </div>

      {/* Streaming Modal */}
      <StreamingModal
        isOpen={showModal}
        streamingContent={streamingContent}
        characterCount={characterCount}
        isComplete={isStreamComplete}
        isGenerating={isGenerating}
        onClose={handleCloseModal}
        onAccept={handleAcceptContent}
        onRegenerate={handleRegenerate}
      />
    </>
  )
}
