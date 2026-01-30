'use client'

import React, { useState, useRef } from 'react'
import { useDocumentInfo, useFormFields, useField } from '@payloadcms/ui'
import { StreamingModal } from './StreamingModal'

export const EmailTemplateActions: React.FC<any> = (props) => {
  const DefaultSaveButton = props.DefaultButton
  const { id } = useDocumentInfo()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [characterCount, setCharacterCount] = useState<number>(0)
  const [showModal, setShowModal] = useState(false)
  const [isStreamComplete, setIsStreamComplete] = useState(false)
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [testResult, setTestResult] = useState<{
    success?: boolean
    error?: string
    preview?: any
  } | null>(null)

  // Refs for storing complete content
  const accumulatedContentRef = useRef<string>('')

  // Type for test email API response
  interface TestEmailResponse {
    success?: boolean
    error?: string
    preview?: any
  }

  // Get the htmlBody field directly
  const htmlBodyField = useField({ path: 'htmlBody' })

  // Get form data
  const subject = useFormFields(([fields]) => fields?.subject?.value as string)
  const description = useFormFields(([fields]) => fields?.description?.value as string)
  const triggerEvent = useFormFields(([fields]) => {
    const automationTriggers = fields?.automationTriggers?.value as any
    return automationTriggers?.triggerEvent as string
  })
  const tenant = useFormFields(([fields]) => {
    const tenantValue = fields?.tenant?.value
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

  // Generate content logic
  const generateContent = async () => {
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
        throw new Error('Failed to generate content')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let accumulatedHtml = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        accumulatedHtml += chunk

        setStreamingContent(accumulatedHtml)
        setCharacterCount(accumulatedHtml.length)
      }

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

    setError(null)
    setSuccess(false)
    setShowModal(true)

    await generateContent()
  }

  const handleRegenerate = async () => {
    await generateContent()
  }

  const handleAcceptContent = () => {
    const content = accumulatedContentRef.current.trim()

    if (content) {
      try {
        // Simple conversion - just set as plain HTML for now
        // You may need to integrate with your convertHtmlToLexical logic
        htmlBodyField.setValue(content)
        setSuccess(true)
        setShowModal(false)

        setTimeout(() => {
          setSuccess(false)
          setStreamingContent('')
          setCharacterCount(0)
        }, 3000)
      } catch (err) {
        console.error('Failed to update editor:', err)
        setError('Failed to apply content to HTML body field')
        setShowModal(false)
      }
    } else {
      setError('No content available to apply')
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

  // Test email logic
  const handleSendTest = async () => {
    if (!testEmail || !id) return

    setIsSending(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: id,
          tenantId: tenant?.id,
          testEmail,
        }),
      })

      const data = (await response.json()) as TestEmailResponse
      setTestResult(data)

      if (data.success) {
        setTimeout(() => {
          setIsTestEmailOpen(false)
          setTestEmail('')
          setTestResult(null)
        }, 3000)
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to send test email' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Generate Email Content Button */}
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
          {isGenerating ? 'Generating...' : 'AI email generator'}
        </button>

        {/* Send Test Email Button */}
        <button
          type="button"
          onClick={() => setIsTestEmailOpen(!isTestEmailOpen)}
          disabled={!id}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: id ? '#3b82f6' : '#9ca3af',
            cursor: id ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'underline',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (id) {
              e.currentTarget.style.color = '#2563eb'
            }
          }}
          onMouseLeave={(e) => {
            if (id) {
              e.currentTarget.style.color = '#3b82f6'
            }
          }}
        >
          📧 Send Test Email
        </button>

        {/* Default Save Button */}
        {DefaultSaveButton && <DefaultSaveButton {...props} />}
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

      {/* Test Email Modal */}
      {isTestEmailOpen && id && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsTestEmailOpen(false)
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              padding: '2rem',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Send Test Email</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="test-email"
                style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}
              >
                Test Email Address
              </label>
              <input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsTestEmailOpen(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#e5e7eb',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={!testEmail || isSending}
                style={{
                  padding: '0.5rem 1rem',
                  background: testEmail && !isSending ? '#10b981' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: testEmail && !isSending ? 'pointer' : 'not-allowed',
                }}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: testResult.success ? '#d1fae5' : '#fee2e2',
                  border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                {testResult.success
                  ? `✅ Test email sent to ${testEmail}`
                  : `❌ ${testResult.error || 'Failed to send'}`}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
