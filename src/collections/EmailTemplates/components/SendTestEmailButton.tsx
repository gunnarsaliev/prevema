'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

export const SendTestEmailButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [isOpen, setIsOpen] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string; preview?: any } | null>(
    null,
  )

  // Get form data
  const templateName = useFormFields(([fields]) => fields?.name?.value as string)
  const team = useFormFields(([fields]) => fields?.team?.value as string)

  const handleSendTest = async () => {
    if (!testEmail || !id) return

    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: id,
          tenantId: team,
          testEmail,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setTimeout(() => {
          setIsOpen(false)
          setTestEmail('')
          setResult(null)
        }, 3000)
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to send test email' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
        {isOpen ? 'Cancel Test' : '📧 Send Test Email'}
      </button>

      {!id && (
        <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
          Save the template first to enable testing
        </p>
      )}

      {isOpen && id && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '14px', fontWeight: 600 }}>
            Send Test Email
          </h4>

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="test-email"
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 500 }}
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

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              <strong>Note:</strong> Test email will use sample data for variables defined in your template. Check the Variables tab to see all available variables.
            </p>
          </div>

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
              fontSize: '14px',
              fontWeight: 500,
              width: '100%',
            }}
          >
            {isSending ? 'Sending...' : 'Send Test Email'}
          </button>

          {result && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: result.success ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
                borderRadius: '4px',
              }}
            >
              {result.success ? (
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#065f46',
                      fontWeight: 500,
                    }}
                  >
                    ✅ Test email sent successfully to {testEmail}
                  </p>
                  {result.preview && (
                    <details style={{ marginTop: '0.5rem' }}>
                      <summary
                        style={{ fontSize: '12px', color: '#065f46', cursor: 'pointer' }}
                      >
                        View Preview
                      </summary>
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          background: 'white',
                          borderRadius: '3px',
                          fontSize: '11px',
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <strong>Subject:</strong> {result.preview.subject}
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#991b1b' }}>
                  ❌ {result.error || 'Failed to send test email'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
