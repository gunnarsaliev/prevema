'use client'

import React, { useState, useEffect } from 'react'
import { VARIABLE_FIELD_MAPPING } from '@/services/variableMapping'

/**
 * Props for the GenerationModal component
 */
interface GenerationModalProps {
  /** Array of participant IDs to generate images for */
  participantIds: string[]
  /** Callback function to close the modal */
  onClose: () => void
}

/**
 * Canvas element structure from image templates
 */
interface CanvasElement {
  id: string
  type: 'image' | 'text' | 'image-variable' | 'text-variable'
  variableName?: string
  variableType?: string
  [key: string]: any
}

/**
 * Image template structure
 */
interface TemplateOption {
  id: string
  name: string
  usageType: 'participant' | 'partner' | 'both'
  width: number
  height: number
  previewImage?: string
  elements: CanvasElement[]
}

/**
 * Information about a template variable
 */
interface VariableInfo {
  /** Type of variable (text or image) */
  type: 'text' | 'image'
  /** Variable type identifier (e.g., "NAME", "EMAIL") */
  variableType: string
  /** Display name of the variable */
  variableName: string
  /** Corresponding participant field name */
  participantField: string
}

/**
 * Template with extracted variable information
 */
interface TemplateWithVariables extends TemplateOption {
  /** List of variables used in the template */
  variables: VariableInfo[]
  /** Whether any participants are missing data for this template */
  missingDataWarning: boolean
}

/**
 * GenerationModal Component
 *
 * Modal dialog for selecting an image template and generating personalized
 * participant images. Displays available templates with variable information
 * and missing data warnings.
 *
 * **Features**:
 * - Template selection with preview thumbnails
 * - Variable information display
 * - Missing data warnings
 * - Progress tracking for bulk generation
 * - Automatic download of generated images/ZIP
 *
 * @param props - Component props
 * @returns React component
 */
export const GenerationModal: React.FC<GenerationModalProps> = ({ participantIds, onClose }) => {
  const [templates, setTemplates] = useState<TemplateWithVariables[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    fileName?: string
    errors?: Array<{
      participantId: string
      participantName: string
      error: string
    }>
    successCount?: number
    failureCount?: number
  } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Fetch templates and participants on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch templates filtered for participant usage
        const templatesResponse = await fetch('/api/load-image-templates?usageType=participant', {
          credentials: 'include',
        })
        const templatesData = (await templatesResponse.json()) as {
          templates: TemplateOption[]
        }

        // Fetch participants
        const participantsPromises = participantIds.map((id) =>
          fetch(`/api/participants/${id}`, {
            credentials: 'include',
          }).then((res) => res.json()),
        )
        const participantsData = await Promise.all(participantsPromises)

        // Process templates to extract variables and check for missing data
        const processedTemplates = templatesData.templates.map((template: TemplateOption) => {
          const variables = extractVariables(template.elements)
          const missingDataWarning = checkMissingData(variables, participantsData)

          return {
            ...template,
            variables,
            missingDataWarning,
          }
        })

        setTemplates(processedTemplates)
        setParticipants(participantsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [participantIds])

  /**
   * Extract variable information from template elements
   * Identifies all text and image variables used in the template
   * and maps them to participant field names
   *
   * @param elements - Array of canvas elements from the template
   * @returns Array of variable information objects
   */
  const extractVariables = (elements: CanvasElement[]): VariableInfo[] => {
    const variables: VariableInfo[] = []

    elements.forEach((element) => {
      // Only process variable elements (text-variable or image-variable)
      if (
        (element.type === 'text-variable' || element.type === 'image-variable') &&
        element.variableType
      ) {
        // Map variable type to participant field using the mapping service
        const participantField = VARIABLE_FIELD_MAPPING[element.variableType] || 'unknown'

        variables.push({
          type: element.type === 'text-variable' ? 'text' : 'image',
          variableType: element.variableType,
          variableName: element.variableName || element.variableType,
          participantField,
        })
      }
    })

    return variables
  }

  /**
   * Check if any participant is missing data for template variables
   * Used to display warning indicators on templates
   *
   * @param variables - Array of variables used in the template
   * @param participants - Array of participant objects
   * @returns True if any participant is missing data for any variable
   */
  const checkMissingData = (variables: VariableInfo[], participants: any[]): boolean => {
    return variables.some((variable) => {
      // Check if any participant is missing this variable's data
      return participants.some((participant) => {
        const value = participant[variable.participantField]
        // Consider null, undefined, or empty string as missing data
        return value === null || value === undefined || value === ''
      })
    })
  }

  /**
   * Handle template selection and initiate image generation
   * Validates input, generates images client-side, and handles the response
   *
   * @param templateId - ID of the selected template
   */
  const handleTemplateSelect = async (templateId: string) => {
    // Clear any previous validation errors
    setValidationError(null)

    // Validate participant IDs are provided
    if (!participantIds || participantIds.length === 0) {
      setValidationError('No participants selected. Please select at least one participant.')
      return
    }

    // Validate template is selected
    if (!templateId) {
      setValidationError('No template selected. Please select a template.')
      return
    }

    // Get the selected template
    const selectedTemplate = templates.find((t) => t.id === templateId)
    if (!selectedTemplate) {
      setValidationError('Template not found.')
      return
    }

    // Initialize generation state
    setSelectedTemplateId(templateId)
    setGenerating(true)
    setProgress({ current: 0, total: participantIds.length })
    setResult(null)

    try {
      // Import client-side services (dynamic import for code splitting)
      const { ClientImageGenerationService } = await import('@/services/clientImageGeneration')
      const { ClientZipArchiveService } = await import('@/services/clientZipArchive')

      const imageService = new ClientImageGenerationService()
      const zipService = new ClientZipArchiveService()

      // Generate images client-side with progress callback
      const generatedImages = await imageService.generateImages(
        participants,
        selectedTemplate as any, // Cast to ImageTemplate
        (current, total) => {
          setProgress({ current, total })
        },
      )

      // Collect errors for failed generations
      const failedParticipants = generatedImages
        .filter((img) => !img.success)
        .map((img) => ({
          participantId: img.participantId,
          participantName: img.participantName,
          error: img.error || 'Unknown error',
        }))

      const successfulImages = generatedImages.filter((img) => img.success)

      // If all generations failed, return error
      if (successfulImages.length === 0) {
        setResult({
          success: false,
          errors: failedParticipants,
        })
        setGenerating(false)
        return
      }

      // Handle single image or multiple images
      if (successfulImages.length === 1) {
        // Single image: download directly
        const image = successfulImages[0]
        downloadBlob(image.blob, image.fileName)

        setResult({
          success: true,
          fileName: image.fileName,
          successCount: 1,
          failureCount: failedParticipants.length,
        })
      } else {
        // Multiple images: create ZIP and download
        const imagesForZip = successfulImages.map((img) => ({
          blob: img.blob,
          fileName: img.fileName,
        }))

        const zipBlob = await zipService.createZip(imagesForZip)
        const zipFileName = zipService.generateZipFilename(selectedTemplate.name)

        downloadBlob(zipBlob, zipFileName)

        setResult({
          success: true,
          fileName: zipFileName,
          successCount: successfulImages.length,
          failureCount: failedParticipants.length,
        })
      }

      setProgress({ current: participantIds.length, total: participantIds.length })
    } catch (error) {
      // Log errors to console
      console.error('Generation failed:', error)

      // Display user-friendly error messages
      let errorMessage = 'An unexpected error occurred during image generation'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      setResult({
        success: false,
        errors: [
          {
            participantId: '',
            participantName: '',
            error: errorMessage,
          },
        ],
      })
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Download a blob as a file
   * @param blob - The blob to download
   * @param fileName - The filename to save as
   */
  const downloadBlob = (blob: Blob, fileName: string) => {
    // Create download link with appropriate filename
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName

    // Trigger automatic download
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up the object URL
    window.URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--theme-overlay-backdrop, rgba(0, 0, 0, 0.6))',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !generating) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--theme-elevation-0, #ffffff)',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--theme-shadow-lg, 0 10px 40px rgba(0, 0, 0, 0.15))',
          border: '1px solid var(--theme-elevation-200)',
        }}
      >
        <div style={{ padding: '2rem' }}>
          <h2
            style={{
              marginTop: 0,
              color: 'var(--theme-text-heading)',
              fontSize: '1.5rem',
              fontWeight: '600',
            }}
          >
            Generate Images for {participantIds.length} Participant
            {participantIds.length > 1 ? 's' : ''}
          </h2>

          {loading && <p style={{ color: 'var(--theme-text-secondary)' }}>Loading templates...</p>}

          {/* Subtask 11.1: Show validation errors in modal */}
          {validationError && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '4px',
                backgroundColor: 'var(--theme-error-100)',
                border: '1px solid var(--theme-error-500)',
              }}
            >
              <p style={{ margin: 0, color: 'var(--theme-error-700)', fontWeight: 'bold' }}>
                ⚠️ Validation Error
              </p>
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--theme-text-secondary)',
                }}
              >
                {validationError}
              </p>
            </div>
          )}

          {!loading && templates.length === 0 && (
            <p style={{ color: 'var(--theme-warning-500)' }}>
              No active templates found for participants.
            </p>
          )}

          {!loading && templates.length > 0 && !generating && !result && (
            <div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--theme-text-secondary)' }}>
                Select a template to generate personalized images:
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={handleTemplateSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {generating && progress && (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '8px',
                background: 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-elevation-300)',
              }}
            >
              <p
                style={{
                  marginBottom: '1rem',
                  fontWeight: '600',
                  color: 'var(--theme-text-primary)',
                }}
              >
                Generating images...
              </p>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--theme-elevation-200)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--theme-success-500)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--theme-text-secondary)',
                }}
              >
                {progress.current} of {progress.total} completed
              </p>
            </div>
          )}

          {result && (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '8px',
                background: result.success
                  ? result.failureCount && result.failureCount > 0
                    ? 'var(--theme-warning-100)'
                    : 'var(--theme-success-100)'
                  : 'var(--theme-error-100)',
                border: `1px solid ${
                  result.success
                    ? result.failureCount && result.failureCount > 0
                      ? 'var(--theme-warning-500)'
                      : 'var(--theme-success-500)'
                    : 'var(--theme-error-500)'
                }`,
              }}
            >
              {result.success ? (
                <div>
                  {/* Subtask 10.3: Show success message after download starts */}
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 'bold',
                      color:
                        result.failureCount && result.failureCount > 0
                          ? 'var(--theme-warning-700)'
                          : 'var(--theme-success-700)',
                    }}
                  >
                    {result.failureCount && result.failureCount > 0
                      ? '⚠️ Partial Success - Some images failed to generate'
                      : '✓ Success! Your download has started.'}
                  </p>

                  {/* Subtask 11.3: Show success count and failure count */}
                  {result.successCount !== undefined && result.failureCount !== undefined && (
                    <p
                      style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.875rem',
                        color: 'var(--theme-text-secondary)',
                      }}
                    >
                      Successfully generated: {result.successCount} /{' '}
                      {result.successCount + result.failureCount}
                      {result.failureCount > 0 && ` (${result.failureCount} failed)`}
                    </p>
                  )}

                  {result.fileName && (
                    <p
                      style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.875rem',
                        color: 'var(--theme-text-secondary)',
                      }}
                    >
                      File: {result.fileName}
                    </p>
                  )}
                  <p
                    style={{
                      margin: '0.75rem 0 0 0',
                      fontSize: '0.875rem',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {participantIds.length === 1
                      ? 'The image has been downloaded to your device.'
                      : result.failureCount && result.failureCount > 0
                        ? `${result.successCount} successful images have been packaged and downloaded as a ZIP file.`
                        : `${participantIds.length} images have been packaged and downloaded as a ZIP file.`}
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--theme-error-700)' }}>
                    ✗ Generation failed
                  </p>

                  {/* Subtask 11.3: Display list of failed participants */}
                  {result.errors && result.errors.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p
                        style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--theme-text-secondary)',
                        }}
                      >
                        Failed participants:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {result.errors.map((error, index) => (
                          <li
                            key={index}
                            style={{
                              fontSize: '0.875rem',
                              color: 'var(--theme-text-secondary)',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {error.participantName ? (
                              <>
                                <strong>{error.participantName}</strong>: {error.error}
                              </>
                            ) : (
                              error.error
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!generating && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              {/* Subtask 11.2: Provide retry button for failures */}
              {result && !result.success && selectedTemplateId && (
                <button
                  type="button"
                  onClick={() => handleTemplateSelect(selectedTemplateId)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    border: '1px solid var(--theme-elevation-300)',
                    background: 'var(--theme-elevation-100)',
                    color: 'var(--theme-text-primary)',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Retry
                </button>
              )}

              {/* Subtask 10.3: Provide option to close modal */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.625rem 1.25rem',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  border: result?.success ? 'none' : '1px solid var(--theme-elevation-300)',
                  background: result?.success
                    ? 'var(--theme-success-500)'
                    : 'var(--theme-elevation-100)',
                  color: result?.success ? '#ffffff' : 'var(--theme-text-primary)',
                  fontWeight: result?.success ? '600' : '500',
                  transition: 'all 0.2s ease',
                }}
              >
                {result?.success ? 'Done' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: TemplateWithVariables
  onSelect: (templateId: string) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? 'var(--theme-shadow-hover, 0 8px 24px rgba(0, 0, 0, 0.12))'
          : 'var(--theme-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06))',
        backgroundColor: 'var(--theme-elevation-0, #ffffff)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(template.id)}
    >
      {/* Preview Image */}
      {template.previewImage && (
        <div
          style={{
            width: '100%',
            height: '150px',
            marginBottom: '1rem',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: 'var(--theme-elevation-100)',
          }}
        >
          <img
            src={template.previewImage}
            alt={template.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Template Name */}
      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'var(--theme-text-heading)',
        }}
      >
        {template.name}
      </h3>

      {/* Dimensions */}
      <p
        style={{
          margin: '0 0 1rem 0',
          fontSize: '0.875rem',
          color: 'var(--theme-text-secondary)',
        }}
      >
        {template.width} × {template.height} px
      </p>

      {/* Variables */}
      {template.variables.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <p
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--theme-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Variables:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {template.variables.map((variable, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    variable.type === 'text'
                      ? 'var(--theme-elevation-200)'
                      : 'var(--theme-elevation-300)',
                  color: 'var(--theme-text-secondary)',
                  border: '1px solid var(--theme-elevation-300)',
                  fontWeight: '500',
                }}
              >
                {variable.variableName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Data Warning */}
      {template.missingDataWarning && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.625rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-warning-100)',
            border: '1px solid var(--theme-warning-400)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'var(--theme-warning-700)',
            }}
          >
            ⚠️ Some participants may be missing data for this template
          </p>
        </div>
      )}
    </div>
  )
}
