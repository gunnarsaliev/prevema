'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'

export const EncryptedField: React.FC = () => {
  const { value, setValue } = useField<string>()
  const [showValue, setShowValue] = useState(false)

  const hasValue = value && value.trim() !== ''

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type={showValue ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder="re_••••••••••••••"
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
          }}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => setShowValue(!showValue)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#f5f5f5',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {showValue ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
        Custom Resend API key (starts with re_). Leave empty to use default.
      </p>
    </div>
  )
}
