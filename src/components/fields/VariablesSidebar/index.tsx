'use client'

import React, { useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import { getAllVariables } from '@/services/emailVariables'
import type { TriggerEvent } from '@/services/emailAutomation'

/**
 * Compact variable reference for sidebar
 * Shows all available variables in a condensed format
 */
export const VariablesSidebarField: React.FC = () => {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Get the trigger event from the form
  const triggerEvent = useFormFields(
    ([fields]) => fields?.automationTriggers?.triggerEvent?.value as TriggerEvent | 'none',
  )

  // Get all variables
  const variableGroups = getAllVariables()

  const copyToClipboard = (variableKey: string) => {
    const variableText = `{{${variableKey}}}`
    navigator.clipboard.writeText(variableText).then(() => {
      setCopiedVariable(variableKey)
      setTimeout(() => setCopiedVariable(null), 2000)
    })
  }

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: 'var(--theme-elevation-100)',
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-300)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--theme-text)',
          }}
        >
          📋 Available Variables
        </h4>
        <span style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Description */}
      {!isExpanded && (
        <p
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '11px',
            color: 'var(--theme-elevation-600)',
          }}
        >
          Click to see all variables
        </p>
      )}

      {/* Expanded variable list */}
      {isExpanded && (
        <div style={{ marginTop: '0.75rem' }}>
          {variableGroups.map((group) => {
            if (group.variables.length === 0) return null

            return (
              <div key={group.label} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--theme-elevation-600)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {group.label}
                </div>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  {group.variables.map((variable) => {
                    const isCopied = copiedVariable === variable.key
                    return (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(variable.key)
                        }}
                        title={variable.description}
                        style={{
                          padding: '0.4rem 0.5rem',
                          backgroundColor: isCopied ? 'var(--theme-success-100)' : 'var(--theme-elevation-0)',
                          border: isCopied ? '1px solid var(--theme-success-500)' : '1px solid var(--theme-elevation-300)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: isCopied ? 'var(--theme-success-700)' : 'var(--theme-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => {
                          if (!isCopied) {
                            e.currentTarget.style.backgroundColor = 'var(--theme-elevation-200)'
                            e.currentTarget.style.borderColor = 'var(--theme-elevation-500)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCopied) {
                            e.currentTarget.style.backgroundColor = 'var(--theme-elevation-0)'
                            e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
                          }
                        }}
                      >
                        <span>{'{{' + variable.key + '}}'}</span>
                        {isCopied && (
                          <span style={{ fontSize: '10px', color: 'var(--theme-success-700)' }}>✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Footer tip */}
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem',
              backgroundColor: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-300)',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'var(--theme-elevation-600)',
            }}
          >
            💡 Click any variable to copy it. See the <strong>Variables</strong> tab for detailed
            descriptions.
          </div>
        </div>
      )}
    </div>
  )
}
