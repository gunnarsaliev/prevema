'use client'

import React, { useState, useEffect } from 'react'
import { X, Mail, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

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
        console.log('📡 Response status:', response.status, response.statusText)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Failed to fetch templates - Status:', response.status, 'Body:', errorText)
          throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`)
        }

        const data = (await response.json()) as { docs?: any[] }
        console.log('📧 Templates fetched:', data.docs?.length || 0, 'Templates:', data.docs)
        setTemplates(data.docs || [])
      } catch (error) {
        console.error('❌ Failed to fetch templates:', error)
        alert(`Failed to load email templates: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`)
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        // Close modal if clicking backdrop
        if (e.target === e.currentTarget && !sending) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-email-modal-title"
    >
      <div className="relative w-[90%] max-w-2xl max-h-[90vh] overflow-auto bg-background border border-border rounded-lg shadow-lg animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={sending}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="pr-8">
            <h2 id="bulk-email-modal-title" className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Send Email to {participantIds.length}{' '}
              {participantIds.length > 1 ? entityLabelPlural : entityLabel}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Select a template and send personalized emails to selected{' '}
              {entityLabelPlural.toLowerCase()}.
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading templates...</span>
            </div>
          )}

          {/* No templates message */}
          {!loading && templates.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  No active email templates found
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please create an active email template for this organization before sending emails.
                </p>
              </div>
            </div>
          )}

          {/* Template selection */}
          {!loading && templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template-select">Email Template</Label>
              <select
                id="template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={sending}
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

          {/* Template info */}
          {selectedTemplateId && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Email variables will be automatically populated from each
                {entityType === 'partner'
                  ? " partner's data (company name, contact person, email, etc.)."
                  : " participant's data (name, email, event, status, etc.)."}
              </p>
            </div>
          )}

          {/* Progress indicator */}
          {progress && (
            <div className="space-y-4 p-4 bg-secondary/50 border border-border rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Sending: {progress.sentCount} of {progress.totalCount}
                </span>
                <span className="text-muted-foreground">
                  {Math.round((progress.sentCount / progress.totalCount) * 100)}%
                </span>
              </div>
              <Progress value={(progress.sentCount / progress.totalCount) * 100} className="h-2" />
              <div className="flex flex-col gap-2">
                {progress.successCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{progress.successCount} successful</span>
                  </div>
                )}
                {progress.failureCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span>{progress.failureCount} failed</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result message */}
          {result && (
            <div
              className={`flex items-start gap-3 p-4 border rounded-lg ${
                result.success
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                {result.success ? (
                  <>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Success! Emails sent to {result.summary?.successful || 0} of{' '}
                      {result.summary?.total || 0}{' '}
                      {result.summary?.total === 1
                        ? entityLabel.toLowerCase()
                        : entityLabelPlural.toLowerCase()}
                      .
                    </p>
                    {result.summary?.failed > 0 && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {result.summary.failed} email(s) failed to send. Check email logs for details.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Failed to send emails
                    </p>
                    {result.summary && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {result.summary.failed} of {result.summary.total} email(s) failed to send.
                      </p>
                    )}
                    {result.results && result.results.length > 0 && result.results[0].error && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        <strong>Error:</strong> {result.results[0].error}
                      </p>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={sending}
            >
              {result?.success ? 'Close' : 'Cancel'}
            </Button>
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={!selectedTemplateId || sending || loading}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send to {participantIds.length}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
