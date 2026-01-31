'use client'

import React, { useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import { getAllVariables } from '@/services/emailVariables'
import type { TriggerEvent } from '@/services/emailAutomation'

/**
 * Comprehensive variable display component for the Variables tab
 * Shows ALL available variables (Participant + Partner + Common) with descriptions, examples, and copy functionality
 */
export const VariablesListField: React.FC = () => {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

  // Get the trigger event from the form (for display purposes)
  const triggerEvent = useFormFields(
    ([fields]) => (fields as any)?.automationTriggers?.triggerEvent?.value as TriggerEvent | 'none',
  )

  // Always show ALL variables in the Variables tab (complete reference guide)
  const variableGroups = getAllVariables()

  // Flatten all variables
  const allVariables = variableGroups.flatMap((group) => group.variables)

  const copyToClipboard = (variableKey: string) => {
    const variableText = `{{${variableKey}}}`
    navigator.clipboard.writeText(variableText).then(() => {
      setCopiedVariable(variableKey)
      setTimeout(() => setCopiedVariable(null), 2000)
    })
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--theme-elevation-100)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid var(--theme-elevation-300)',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', color: 'var(--theme-text)' }}>
          📋 All Available Variables
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-elevation-600)' }}>
          Below is the complete list of all variables you can use in your email templates. Click on
          any variable to copy it to your clipboard, then paste it into your subject or email body.
        </p>
        {triggerEvent && triggerEvent !== 'none' && (
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: '13px',
              color: 'var(--theme-elevation-700)',
              fontStyle: 'italic',
            }}
          >
            💡 Your current trigger event is "{triggerEvent}" - you can use any variable below, but
            variables relevant to your trigger will have actual data.
          </p>
        )}
      </div>

      {/* Variable Groups */}
      {variableGroups.map((group, groupIndex) => {
        if (group.variables.length === 0) return null

        return (
          <div
            key={group.label}
            style={{
              marginBottom: groupIndex < variableGroups.length - 1 ? '2rem' : '0',
            }}
          >
            <h4
              style={{
                margin: '0 0 1rem 0',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--theme-text)',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--theme-elevation-300)',
              }}
            >
              {group.label}
            </h4>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {group.variables.map((variable) => {
                const variableText = `{{${variable.key}}}`
                const isCopied = copiedVariable === variable.key

                return (
                  <div
                    key={variable.key}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--theme-elevation-50)',
                      border: '1px solid var(--theme-elevation-300)',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onClick={() => copyToClipboard(variable.key)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-elevation-500)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Variable Name */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <code
                        style={{
                          backgroundColor: 'var(--theme-elevation-200)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--theme-text)',
                        }}
                      >
                        {variableText}
                      </code>

                      {/* Copy indicator */}
                      <span
                        style={{
                          fontSize: '12px',
                          color: isCopied
                            ? 'var(--theme-success-700)'
                            : 'var(--theme-elevation-600)',
                          fontWeight: isCopied ? 600 : 400,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isCopied ? '✓ Copied!' : 'Click to copy'}
                      </span>
                    </div>

                    {/* Description */}
                    <div
                      style={{
                        marginBottom: '0.5rem',
                        color: 'var(--theme-elevation-700)',
                        fontSize: '14px',
                      }}
                    >
                      {variable.description}
                    </div>

                    {/* Example */}
                    <div
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--theme-elevation-100)',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: 'var(--theme-elevation-600)',
                        fontStyle: 'italic',
                      }}
                    >
                      <strong style={{ fontStyle: 'normal', color: 'var(--theme-elevation-700)' }}>
                        Example:
                      </strong>{' '}
                      "{variable.example}"
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Usage Examples */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--theme-elevation-100)',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-300)',
        }}
      >
        <h4
          style={{
            margin: '0 0 1rem 0',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--theme-text)',
          }}
        >
          💡 Usage Examples
        </h4>

        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-elevation-600)',
              marginBottom: '0.5rem',
            }}
          >
            Subject Line:
          </div>
          <code
            style={{
              display: 'block',
              padding: '0.75rem',
              backgroundColor: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-300)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: 'var(--theme-text)',
            }}
          >
            Welcome {'{{name}}'} to {'{{event}}'}!
          </code>
        </div>

        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-elevation-600)',
              marginBottom: '0.5rem',
            }}
          >
            Email Body:
          </div>
          <code
            style={{
              display: 'block',
              padding: '0.75rem',
              backgroundColor: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-300)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: 'var(--theme-text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {`Hello {{name}},

Thank you for registering for {{event}}!

Your current status: {{status}}

Best regards,
{{tenantName}}`}
          </code>
        </div>
      </div>
    </div>
  )
}
