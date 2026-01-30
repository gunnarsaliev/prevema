'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'
import { TextFieldClientComponent } from 'payload'

const PublicFormLinkField: TextFieldClientComponent = ({ path, readOnly }) => {
  const { value } = useField({ path })
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value as string)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (!value) {
    return (
      <div className="field-type text">
        <label className="field-label">Public Form Link</label>
        <p className="field-description">
          Save this participant type to generate a public registration link
        </p>
      </div>
    )
  }

  return (
    <div className="field-type text">
      <label className="field-label">Public Form Link</label>
      <p className="field-description">
        Share this link with people to register as this participant type
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          type="text"
          value={value as string}
          readOnly
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #6a6a6a',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#222222',
            color: '#e2e8f0',
          }}
        />
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

export default PublicFormLinkField
