'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields, useForm } from '@payloadcms/ui'

/**
 * Generate Social Posts Button Component
 * Displays a button in the participant detail view to generate social media posts for all platforms
 */
export const GenerateSocialPostButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const { dispatchFields, setModified } = useForm()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get form data
  const name = useFormFields(([fields]) => fields?.name?.value as string)
  const biography = useFormFields(([fields]) => fields?.biography?.value as string)
  const companyName = useFormFields(([fields]) => fields?.companyName?.value as string)
  const companyPosition = useFormFields(([fields]) => fields?.companyPosition?.value as string)
  const presentationTopic = useFormFields(([fields]) => fields?.presentationTopic?.value as string)
  const presentationSummary = useFormFields(([fields]) => fields?.presentationSummary?.value as string)
  const eventData = useFormFields(([fields]) => fields?.event?.value)

  const handleGenerateClick = async () => {
    if (!id) return

    setIsGenerating(true)
    setError(null)

    try {
      // Extract event details
      let eventName = ''
      let eventDescription = ''
      let eventWhy = ''
      let eventWhat = ''
      let eventWhere = ''
      let eventWho = ''
      let eventTheme = ''

      if (eventData && typeof eventData === 'object') {
        eventName = (eventData as any).name || ''
        eventDescription = (eventData as any).description || ''
        eventWhy = (eventData as any).why || ''
        eventWhat = (eventData as any).what || ''
        eventWhere = (eventData as any).where || ''
        eventWho = (eventData as any).who || ''
        eventTheme = (eventData as any).theme || ''
      }

      // Call API to generate social posts for all platforms
      const response = await fetch('/api/generate-social-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'participant',
          mode: 'all',
          participantData: {
            name,
            biography,
            companyName,
            companyPosition,
            presentationTopic,
            presentationSummary,
          },
          eventName,
          eventDescription,
          eventWhy,
          eventWhat,
          eventWhere,
          eventWho,
          eventTheme,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate social posts')
      }

      const data = await response.json()

      // Update all platform fields with the generated content
      dispatchFields({
        type: 'UPDATE',
        path: 'socialPostLinkedIn',
        value: data.posts.linkedin,
      })

      dispatchFields({
        type: 'UPDATE',
        path: 'socialPostTwitter',
        value: data.posts.twitter,
      })

      dispatchFields({
        type: 'UPDATE',
        path: 'socialPostFacebook',
        value: data.posts.facebook,
      })

      dispatchFields({
        type: 'UPDATE',
        path: 'socialPostInstagram',
        value: data.posts.instagram,
      })

      dispatchFields({
        type: 'UPDATE',
        path: 'socialPostGeneratedAt',
        value: data.generatedAt,
      })

      // Mark form as modified to enable save button
      setModified(true)

      console.log('✅ Social posts generated successfully for all platforms')
    } catch (err) {
      console.error('Error generating social posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate social posts')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        type="button"
        onClick={handleGenerateClick}
        disabled={!id || isGenerating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: id && !isGenerating ? 'var(--theme-elevation-500)' : 'var(--theme-elevation-200)',
          color: id && !isGenerating ? 'white' : 'var(--theme-elevation-500)',
          border: 'none',
          borderRadius: '4px',
          cursor: id && !isGenerating ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 500,
          width: '100%',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (id && !isGenerating) {
            e.currentTarget.style.background = 'var(--theme-elevation-600)'
          }
        }}
        onMouseLeave={(e) => {
          if (id && !isGenerating) {
            e.currentTarget.style.background = 'var(--theme-elevation-500)'
          }
        }}
      >
        {isGenerating ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
            Generating All Posts...
          </>
        ) : (
          <>
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Generate All Social Posts
          </>
        )}
      </button>

      {!id && (
        <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
          Save the participant first to enable social posts generation
        </p>
      )}

      {!isGenerating && !error && id && (
        <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
          Generates posts for LinkedIn, Twitter, Facebook, and Instagram
        </p>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '0.5rem' }}>
          Error: {error}
        </p>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
