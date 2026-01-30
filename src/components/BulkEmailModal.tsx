'use client'

import React, { useState, useEffect } from 'react'

interface BulkEmailModalProps {
  participantIds: string[]
  organizationId: string
  onClose: () => void
  entityType?: 'participant' | 'partner'
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({
  participantIds,
  organizationId,
  onClose,
  entityType = 'participant',
}) => {
  console.log('📧 BulkEmailModal mounted with:', { participantIds, organizationId, entityType })

  const entityLabel = entityType === 'partner' ? 'Partner' : 'Participant'
  const entityLabelPlural = entityType === 'partner' ? 'Partners' : 'Participants'

  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState<{
    sentCount: number
    leftCount: number
    totalCount: number
    currentEmail: string
    successCount: number
    failureCount: number
  } | null>(null)

  // Fetch available email templates for this organization
  useEffect(() => {
    console.log('📡 Fetching templates for organization:', organizationId)
    const fetchTemplates = async () => {
      setLoading(true)
      try {
        const url = `/api/email-templates?where[organization][equals]=${organizationId}&where[isActive][equals]=true&limit=100`
        console.log('📡 Fetch URL:', url)
        const response = await fetch(url)
        const data = (await response.json()) as { docs?: any[] }
        console.log('📧 Templates fetched:', data.docs?.length || 0)
        setTemplates(data.docs || [])
      } catch (error) {
        console.error('❌ Failed to fetch templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [organizationId])

  const handleSendEmail = async () => {
    if (!selectedTemplateId) {
      alert('Please select an email template')
      return
    }

    setSending(true)
    setResult(null)
    setProgress(null)

    try {
      const requestBody: any = {
        templateId: selectedTemplateId,
        organizationId,
      }

      // Send appropriate IDs based on entity type
      if (entityType === 'partner') {
        requestBody.partnerIds = participantIds // Using participantIds array for partner IDs
      } else {
        requestBody.participantIds = participantIds
      }

      const response = await fetch('/api/send-manual-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      // Read the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep the last partial line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6)
            try {
              const data = JSON.parse(jsonStr)

              if (data.type === 'progress') {
                setProgress({
                  sentCount: data.sentCount,
                  leftCount: data.leftCount,
                  totalCount: data.totalCount,
                  currentEmail: data.currentEmail,
                  successCount: data.successCount,
                  failureCount: data.failureCount,
                })
              } else if (data.type === 'complete') {
                setResult(data)

                if (data.success) {
                  // Auto-close after 3 seconds on success
                  setTimeout(() => {
                    onClose()
                  }, 3000)
                }
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send emails:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSending(false)
    }
  }

  return (
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
        // Close modal if clicking backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>
            Send Email to {participantIds.length}{' '}
            {participantIds.length > 1 ? entityLabelPlural : entityLabel}
          </h2>

          {loading && <p>Loading templates...</p>}

          {!loading && templates.length === 0 && (
            <p style={{ color: 'var(--theme-warning-500)' }}>
              No active email templates found for this organization.
            </p>
          )}

          {!loading && templates.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="template-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Select Email Template
              </label>
              <select
                id="template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid var(--theme-elevation-300)',
                }}
              >
                <option value="">-- Choose a template --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTemplateId && (
            <div
              style={{
                background: 'var(--theme-elevation-50)',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--theme-elevation-700)' }}>
                <strong>Note:</strong> Email variables will be automatically populated from each
                {entityType === 'partner'
                  ? " partner's data (company name, contact person, email, etc.)."
                  : " participant's data (name, email, event, status, etc.)."}
              </p>
            </div>
          )}

          {progress && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                background: 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-elevation-300)',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                    Sending emails: {progress.sentCount} sent, {progress.leftCount} left
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-600)' }}>
                    {progress.sentCount}/{progress.totalCount}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--theme-elevation-200)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(progress.sentCount / progress.totalCount) * 100}%`,
                      height: '100%',
                      backgroundColor: 'var(--theme-success-500)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
              {progress.successCount > 0 && (
                <p
                  style={{
                    margin: '0.25rem 0',
                    fontSize: '0.875rem',
                    color: 'var(--theme-success-700)',
                  }}
                >
                  ✓ {progress.successCount} successful
                </p>
              )}
              {progress.failureCount > 0 && (
                <p
                  style={{
                    margin: '0.25rem 0',
                    fontSize: '0.875rem',
                    color: 'var(--theme-error-700)',
                  }}
                >
                  ✗ {progress.failureCount} failed
                </p>
              )}
            </div>
          )}

          {result && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                background: result.success ? 'var(--theme-success-100)' : 'var(--theme-error-100)',
                border: `1px solid ${result.success ? 'var(--theme-success-500)' : 'var(--theme-error-500)'}`,
              }}
            >
              {result.success ? (
                <>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--theme-success-700)' }}>
                    Success! Emails sent to {result.summary?.successful || 0} of{' '}
                    {result.summary?.total || 0}{' '}
                    {result.summary?.total === 1
                      ? entityLabel.toLowerCase()
                      : entityLabelPlural.toLowerCase()}
                    .
                  </p>
                  {result.summary?.failed > 0 && (
                    <p
                      style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.875rem',
                        color: 'var(--theme-error-700)',
                      }}
                    >
                      {result.summary.failed} email(s) failed to send. Check email logs for details.
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, color: 'var(--theme-error-700)' }}>
                  Error: {result.error || 'Failed to send emails'}
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              style={{
                padding: '0.5rem 1rem',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.5 : 1,
              }}
            >
              {result?.success ? 'Close' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={!selectedTemplateId || sending || loading}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--theme-success-500)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !selectedTemplateId || sending || loading ? 'not-allowed' : 'pointer',
                opacity: !selectedTemplateId || sending || loading ? 0.5 : 1,
              }}
            >
              {sending
                ? 'Sending...'
                : `Send to ${participantIds.length} ${participantIds.length > 1 ? entityLabelPlural : entityLabel}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
