'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { getAvailableVariables } from '@/services/emailVariables'
import type { TriggerEvent } from '@/services/emailAutomation'

export const AvailableVariablesField: React.FC = () => {
  // Get the trigger event from the form
  const triggerEvent = useFormFields(
    ([fields]) => fields?.automationTriggers?.triggerEvent?.value as TriggerEvent | 'none',
  )

  // Get the predefined variables for this trigger event
  const variableGroups = getAvailableVariables(triggerEvent || 'none')

  // Flatten all variables
  const allVariables = variableGroups.flatMap((group) => group.variables)

  if (allVariables.length === 0) {
    return (
      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          Select a trigger event in the Settings tab to see available variables.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        border: '1px solid #ddd',
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>
        Available Variables for {triggerEvent || 'Manual Emails'}
      </h4>
      <p style={{ margin: '0 0 1rem 0', fontSize: '13px', color: '#666' }}>
        Use these variables in your subject and body using{' '}
        <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '2px' }}>
          {'{{variableName}}'}
        </code>{' '}
        syntax:
      </p>

      {variableGroups.map((group) => {
        if (group.variables.length === 0) return null

        return (
          <div key={group.label} style={{ marginBottom: '1rem' }}>
            <h5
              style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                fontSize: '13px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              {group.label}
            </h5>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {group.variables.map((variable) => (
                <div
                  key={variable.key}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '3px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code
                      style={{
                        backgroundColor: '#f0f0f0',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {'{{' + variable.key + '}}'}
                    </code>
                    <span style={{ color: '#666' }}>- {variable.description}</span>
                  </div>
                  <div style={{ marginTop: '0.25rem', color: '#999', fontSize: '11px' }}>
                    Example: "{variable.example}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#e8f4f8',
          borderRadius: '3px',
          fontSize: '12px',
          color: '#0066cc',
        }}
      >
        <strong>💡 Quick Example:</strong>
        <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '11px' }}>
          <div>Subject: Welcome {'{{name}}'} to {'{{event}}'}!</div>
          <div style={{ marginTop: '0.25rem' }}>
            Body: Hello {'{{name}}'}, thank you for registering...
          </div>
        </div>
      </div>
    </div>
  )
}
