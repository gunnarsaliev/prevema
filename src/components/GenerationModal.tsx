'use client'

import React, { useState, useEffect } from 'react'
import { X, Image as ImageIcon, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { VARIABLE_FIELD_MAPPING } from '@/services/variableMapping'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

/**
 * Props for the GenerationModal component
 */
interface GenerationModalProps {
  /** Array of participant/partner IDs to generate images for */
  participantIds: string[]
  /** Callback function to close the modal */
  onClose: () => void
  /** Entity type: participant or partner */
  entityType?: 'participant' | 'partner'
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
  width: number
  height: number
  isPublic?: boolean
  isPremium?: boolean
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
export const GenerationModal: React.FC<GenerationModalProps> = ({
  participantIds,
  onClose,
  entityType = 'participant'
}) => {
  const entityLabel = entityType === 'partner' ? 'Partner' : 'Participant'
  const entityLabelPlural = entityType === 'partner' ? 'Partners' : 'Participants'
  const entityCollectionSlug = entityType === 'partner' ? 'partners' : 'participants'

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
        // Fetch templates (all templates are now usable for both participants and partners)
        const templatesResponse = await fetch('/api/load-image-templates', {
          credentials: 'include',
        })
        const templatesData = (await templatesResponse.json()) as {
          templates: TemplateOption[]
        }

        // Fetch entities (participants or partners)
        const entitiesPromises = participantIds.map((id) =>
          fetch(`/api/${entityCollectionSlug}/${id}?depth=2`, {
            credentials: 'include',
          }).then((res) => res.json()),
        )
        const participantsData = await Promise.all(entitiesPromises)

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
  }, [participantIds, entityType, entityCollectionSlug])

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

    // Validate entity IDs are provided
    if (!participantIds || participantIds.length === 0) {
      setValidationError(`No ${entityLabelPlural.toLowerCase()} selected. Please select at least one ${entityLabel.toLowerCase()}.`)
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !generating) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="generation-modal-title"
    >
      <div className="relative w-[90%] max-w-4xl max-h-[90vh] overflow-auto bg-background border border-border rounded-lg shadow-lg animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={generating}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="pr-8">
            <h2
              id="generation-modal-title"
              className="text-2xl font-semibold tracking-tight flex items-center gap-2"
            >
              <ImageIcon className="h-6 w-6 text-primary" />
              Generate Images for {participantIds.length}{' '}
              {participantIds.length > 1 ? entityLabelPlural : entityLabel}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Select a template to generate personalized images for selected{' '}
              {entityLabelPlural.toLowerCase()}.
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading templates...</span>
            </div>
          )}

          {/* Validation errors */}
          {validationError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Validation Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {validationError}
                </p>
              </div>
            </div>
          )}

          {/* No templates message */}
          {!loading && templates.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  No active templates found
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please create an active image template for {entityLabelPlural.toLowerCase()} before generating images.
                </p>
              </div>
            </div>
          )}

          {/* Template selection */}
          {!loading && templates.length > 0 && !generating && !result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={handleTemplateSelect}
                    entityLabelPlural={entityLabelPlural}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {generating && progress && (
            <div className="space-y-4 p-4 bg-secondary/50 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="font-medium text-sm">
                  Generating images...
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progress: {progress.current} of {progress.total}
                  </span>
                  <span className="font-medium">
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
                <Progress value={(progress.current / progress.total) * 100} className="h-2" />
              </div>
            </div>
          )}

          {/* Result message */}
          {result && (
            <div
              className={`flex items-start gap-3 p-4 border rounded-lg ${
                result.success
                  ? result.failureCount && result.failureCount > 0
                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                    : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
              }`}
            >
              {result.success ? (
                result.failureCount && result.failureCount > 0 ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                )
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                {result.success ? (
                  <>
                    <p
                      className={`font-medium ${
                        result.failureCount && result.failureCount > 0
                          ? 'text-yellow-800 dark:text-yellow-200'
                          : 'text-green-800 dark:text-green-200'
                      }`}
                    >
                      {result.failureCount && result.failureCount > 0
                        ? 'Partial Success - Some images failed to generate'
                        : 'Success! Your download has started.'}
                    </p>

                    {result.successCount !== undefined && result.failureCount !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Successfully generated: {result.successCount} /{' '}
                        {result.successCount + result.failureCount}
                        {result.failureCount > 0 && ` (${result.failureCount} failed)`}
                      </p>
                    )}

                    {result.fileName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        File: <span className="font-mono">{result.fileName}</span>
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground mt-2">
                      {participantIds.length === 1
                        ? `The ${entityLabel.toLowerCase()} image has been downloaded to your device.`
                        : result.failureCount && result.failureCount > 0
                          ? `${result.successCount} successful ${entityLabel.toLowerCase()} images have been packaged and downloaded as a ZIP file.`
                          : `${participantIds.length} ${entityLabel.toLowerCase()} images have been packaged and downloaded as a ZIP file.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Generation failed
                    </p>

                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Failed {entityLabelPlural.toLowerCase()}:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700 dark:text-red-300">
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
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {!generating && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              {result && !result.success && selectedTemplateId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTemplateSelect(selectedTemplateId)}
                >
                  Retry
                </Button>
              )}
              <Button
                type="button"
                variant={result?.success ? 'default' : 'outline'}
                onClick={onClose}
              >
                {result?.success ? 'Done' : 'Close'}
              </Button>
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
  entityLabelPlural: string
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, entityLabelPlural }) => {
  return (
    <div
      className="group border border-border rounded-lg p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-card"
      onClick={() => onSelect(template.id)}
    >
      {/* Preview Image */}
      {template.previewImage && (
        <div className="w-full h-40 mb-4 rounded overflow-hidden bg-muted">
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Template Name */}
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {template.name}
      </h3>

      {/* Dimensions */}
      <p className="text-sm text-muted-foreground mb-3">
        {template.width} × {template.height} px
      </p>

      {/* Variables */}
      {template.variables.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Variables:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template.variables.map((variable, index) => (
              <Badge
                key={index}
                variant={variable.type === 'text' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {variable.variableName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Data Warning */}
      {template.missingDataWarning && (
        <div className="flex items-start gap-2 mt-3 p-2.5 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
          <AlertCircle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Some {entityLabelPlural.toLowerCase()} may be missing data for this template
          </p>
        </div>
      )}
    </div>
  )
}
