'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const EmailConfigStatus: React.FC = () => {
  const emailConfig = useFormFields(([fields]) => fields?.emailConfig?.value as any)

  if (!emailConfig) {
    return null
  }

  const { isActive, resendApiKey, fromEmail, senderName } = emailConfig

  if (!isActive) {
    return (
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: 0, fontSize: '13ßpx', color: '#6b7280' }}>
          Custom email configuration is disabled. Using default configuration.
        </p>
      </div>
    )
  }

  // Check for validation issues
  const issues: string[] = []

  if (!resendApiKey || !resendApiKey.startsWith('re_')) {
    issues.push('Invalid or missing API key')
  }

  if (!fromEmail) {
    issues.push('Missing from email address')
  }

  if (!senderName) {
    issues.push('Missing sender name (recommended)')
  }

  const isValid = issues.length === 0
  const hasWarnings = issues.length > 0 && issues.some((i) => i.includes('recommended'))
  const hasErrors = issues.some((i) => !i.includes('recommended'))

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: isValid ? '#d1fae5' : hasErrors ? '#fee2e2' : '#fef3c7',
        border: `1px solid ${isValid ? '#10b981' : hasErrors ? '#ef4444' : '#f59e0b'}`,
        borderRadius: '4px',
      }}
    >
      {isValid ? (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#065f46',
            fontWeight: 500,
          }}
        >
          ✅ Email configuration is valid and ready to use
        </p>
      ) : (
        <div>
          <p
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '13px',
              color: hasErrors ? '#991b1b' : '#92400e',
              fontWeight: 500,
            }}
          >
            {hasErrors ? '❌' : '⚠️'} Configuration {hasErrors ? 'Errors' : 'Warnings'}:
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.5rem',
              fontSize: '12px',
              color: hasErrors ? '#991b1b' : '#92400e',
            }}
          >
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {isValid && (
        <div style={{ marginTop: '0.5rem', fontSize: '11px', color: '#065f46' }}>
          <strong>From:</strong> {senderName} &lt;{fromEmail}&gt;
        </div>
      )}
    </div>
  )
}
