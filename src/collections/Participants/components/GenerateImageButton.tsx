'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { GenerationModal } from '@/components/GenerationModal'

/**
 * Generate Image Button Component
 * Displays a button in the participant detail view to generate personalized images
 */
export const GenerateImageButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get participant name from form
  const participantName = useFormFields(([fields]) => fields?.name?.value as string)

  const handleGenerateClick = () => {
    if (!id) return
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        type="button"
        onClick={handleGenerateClick}
        disabled={!id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: id ? 'var(--theme-elevation-500)' : 'var(--theme-elevation-200)',
          color: id ? 'white' : 'var(--theme-elevation-500)',
          border: 'none',
          borderRadius: '4px',
          cursor: id ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 500,
          width: '100%',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (id) {
            e.currentTarget.style.background = 'var(--theme-elevation-600)'
          }
        }}
        onMouseLeave={(e) => {
          if (id) {
            e.currentTarget.style.background = 'var(--theme-elevation-500)'
          }
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Generate Image
      </button>

      {!id && (
        <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
          Save the participant first to enable image generation
        </p>
      )}

      {isModalOpen && id && (
        <GenerationModal participantIds={[String(id)]} onClose={handleCloseModal} />
      )}
    </div>
  )
}
