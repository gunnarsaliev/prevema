'use client'

import React from 'react'

interface StreamingModalProps {
  isOpen: boolean
  streamingContent: string
  characterCount: number
  isComplete: boolean
  isGenerating: boolean
  onClose: () => void
  onAccept: () => void
  onRegenerate: () => void
}

export const StreamingModal: React.FC<StreamingModalProps> = ({
  isOpen,
  streamingContent,
  characterCount,
  isComplete,
  isGenerating,
  onClose,
  onAccept,
  onRegenerate,
}) => {
  if (!isOpen) return null

  // Estimate word count (average 5 characters per word)
  const wordCount = Math.round(characterCount / 5)

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
        // Close modal if clicking backdrop (only if complete)
        if (e.target === e.currentTarget && isComplete) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--theme-elevation-0)',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--theme-elevation-300)',
            background: 'var(--theme-elevation-100)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--theme-text)' }}>
              {isComplete ? 'Content Generated' : 'Generating Email Content...'}
            </h2>
            {isComplete && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--theme-elevation-600)',
                  padding: '0.25rem',
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.875rem',
              color: 'var(--theme-elevation-600)',
              fontFamily: 'monospace',
            }}
          >
            {characterCount > 0 ? (
              <span>
                {characterCount} characters • {wordCount} words
              </span>
            ) : (
              <span>Waiting for response...</span>
            )}
          </div>

          {/* Progress indicator */}
          {!isComplete && (
            <div
              style={{
                marginTop: '0.75rem',
                width: '100%',
                height: '4px',
                backgroundColor: 'var(--theme-elevation-300)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: 'var(--theme-elevation-600)',
                  animation: 'progress 1.5s ease-in-out infinite',
                  width: '30%',
                }}
              />
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            backgroundColor: 'var(--theme-elevation-0)',
          }}
        >
          <div
            style={{
              border: '1px solid var(--theme-elevation-300)',
              borderRadius: '6px',
              padding: '1rem',
              backgroundColor: 'var(--theme-elevation-50)',
              minHeight: '200px',
              maxHeight: '400px',
              overflowY: 'auto',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--theme-text)',
            }}
          >
            {streamingContent ? (
              <div dangerouslySetInnerHTML={{ __html: streamingContent }} />
            ) : (
              <div style={{ color: 'var(--theme-elevation-600)', fontStyle: 'italic' }}>
                Waiting for AI to generate content...
              </div>
            )}

            {/* Typing cursor when not complete */}
            {!isComplete && streamingContent && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1em',
                  backgroundColor: 'var(--theme-elevation-700)',
                  marginLeft: '2px',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </div>

          {isComplete && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--theme-success-100)',
                border: '1px solid var(--theme-success-500)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: 'var(--theme-success-700)',
              }}
            >
              ✅ Generation complete! Review the content above and click "Copy Text" to copy it to your clipboard.
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid var(--theme-elevation-300)',
            backgroundColor: 'var(--theme-elevation-100)',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {isComplete && streamingContent && (
              <button
                type="button"
                onClick={onRegenerate}
                disabled={isGenerating}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: '1px solid var(--theme-warning-500)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--theme-elevation-0)',
                  color: 'var(--theme-warning-600)',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-warning-100)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-0)'
                  }
                }}
              >
                Regenerate
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={!isComplete}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid var(--theme-elevation-400)',
                borderRadius: '6px',
                backgroundColor: 'var(--theme-elevation-0)',
                color: 'var(--theme-text)',
                cursor: isComplete ? 'pointer' : 'not-allowed',
                opacity: isComplete ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (isComplete) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-elevation-200)'
                }
              }}
              onMouseLeave={(e) => {
                if (isComplete) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-elevation-0)'
                }
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={!isComplete || !streamingContent}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isComplete && streamingContent ? 'var(--theme-success-500)' : 'var(--theme-elevation-400)',
                color: 'white',
                cursor: isComplete && streamingContent ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (isComplete && streamingContent) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-success-600)'
                }
              }}
              onMouseLeave={(e) => {
                if (isComplete && streamingContent) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-success-500)'
                }
              }}
            >
              Copy Text
            </button>
          </div>
        </div>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes progress {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(300%); }
              100% { transform: translateX(-100%); }
            }

            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
          `}
        </style>
      </div>
    </div>
  )
}
