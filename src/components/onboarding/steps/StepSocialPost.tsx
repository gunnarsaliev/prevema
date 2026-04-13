'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageDropzone } from '@/components/ImageDropzone'
import {
  recordSocialPostPreferenceAction,
  saveOnboardingImageTemplateAction,
} from '@/app/(frontend)/onboarding/actions'

interface StepSocialPostProps {
  stepIndex: number
  onValidationChange: (stepIndex: number, isValid: boolean) => void
  organizationId: number
  onPreferenceSelected?: (preference: 'own' | 'create') => void
  onNext?: () => void
}

export const StepSocialPost = ({
  stepIndex,
  onValidationChange,
  organizationId,
  onPreferenceSelected,
  onNext,
}: StepSocialPostProps) => {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<'own' | 'create' | null>('create')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectOption = (option: 'own' | 'create') => {
    setSelectedOption(option)
    // Reset uploaded image when switching options
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setUploadedImage(null)
    setPreviewUrl(null)
    // For 'own' option, validation requires image upload
    // For 'create' option, no image upload needed
    if (option === 'create') {
      onValidationChange(stepIndex, true)
    } else {
      // For 'own', wait for image upload
      onValidationChange(stepIndex, false)
    }
  }

  const handleImageUpload = async (file: File) => {
    // Revoke old preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create new preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setUploadedImage(file)

    // Mark step as valid once image is uploaded
    onValidationChange(stepIndex, true)
    return { success: true }
  }

  // Set initial validation state on mount
  useEffect(() => {
    if (selectedOption === 'create') {
      onValidationChange(stepIndex, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleNext = async () => {
    if (!selectedOption) return

    setIsSubmitting(true)
    try {
      await recordSocialPostPreferenceAction(organizationId, selectedOption)
      if (onPreferenceSelected) {
        onPreferenceSelected(selectedOption)
      }

      // Handle image upload for "own" option - save as ImageTemplate
      if (selectedOption === 'own' && uploadedImage) {
        const result = await saveOnboardingImageTemplateAction(organizationId, uploadedImage)

        if (result.success) {
          console.log('Image template created:', result.data)
          // Redirect to dashboard after successful upload
          router.push('/dash')
        } else {
          console.error('Failed to save image template:', result.message)
          alert(result.message || 'Failed to save image template. Please try again.')
          setIsSubmitting(false)
        }
      } else if (selectedOption === 'create') {
        // Redirect to image generator if "create" option was selected
        router.push('/dash/image-generator')
      } else {
        onNext?.()
      }
    } catch (error) {
      console.error('Error saving preference:', error)
      alert('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onNext?.()
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Communication design</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            How would you like to create communication designs for participants and partners?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: I have my own */}
          <button
            type="button"
            onClick={() => handleSelectOption('own')}
            className={`relative p-6 rounded-xl border transition-all text-left ${
              selectedOption === 'own'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border/30 bg-card/30 hover:border-border/50 hover:bg-card/50'
            }`}
          >
            {/* Radio button indicator - top right */}
            <div className="absolute top-6 right-6">
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedOption === 'own'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 bg-transparent'
                }`}
              >
                {selectedOption === 'own' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 pt-2">
              <div
                className={`rounded-full p-3 transition-colors ${
                  selectedOption === 'own' ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                <ImageIcon
                  className={`h-8 w-8 transition-colors ${
                    selectedOption === 'own' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg mb-1">Custom templates</h4>
                <p className="text-sm text-muted-foreground">
                  Upload and save your custom background
                </p>
              </div>
            </div>

            {/* Bottom indicator line */}
            {selectedOption === 'own' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />
            )}
          </button>

          {/* Option 2: Create design */}
          <button
            type="button"
            onClick={() => handleSelectOption('create')}
            className={`relative p-6 rounded-xl border transition-all text-left ${
              selectedOption === 'create'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border/30 bg-card/30 hover:border-border/50 hover:bg-card/50'
            }`}
          >
            {/* Radio button indicator - top right */}
            <div className="absolute top-6 right-6">
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedOption === 'create'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 bg-transparent'
                }`}
              >
                {selectedOption === 'create' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 pt-2">
              <div
                className={`rounded-full p-3 transition-colors ${
                  selectedOption === 'create' ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                <Palette
                  className={`h-8 w-8 transition-colors ${
                    selectedOption === 'create' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg mb-1">
                  Generate with Prevema
                </h4>
                <p className="text-sm text-muted-foreground">Use our image generator</p>
              </div>
            </div>

            {/* Bottom indicator line */}
            {selectedOption === 'create' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* Show dropzone when "own" option is selected */}
        {selectedOption === 'own' && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Upload your custom design image to save as a template background
            </p>
            <div className="flex justify-center">
              <ImageDropzone onUpload={handleImageUpload} maxSizeMB={10} />
            </div>
            {uploadedImage && previewUrl && (
              <div className="mt-6 space-y-4">
                {/* Image Preview */}
                <div className="flex justify-center">
                  <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-lg max-w-md w-full">
                    <img
                      src={previewUrl}
                      alt="Preview of uploaded background"
                      className="w-full h-auto object-contain max-h-80"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      Preview
                    </div>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4 rounded-md bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                      <ImageIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{uploadedImage.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB • This image will be
                        saved as a template background
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedOption === 'create' && (
          <div className="mt-6 p-4 rounded-md bg-muted/50 border border-border">
            <p className="text-sm text-foreground">
              Excellent choice! After completing onboarding, you'll be redirected to the image
              generator tool to create your template.
            </p>
          </div>
        )}

        {!selectedOption && (
          <>
            <p className="text-xs text-center text-muted-foreground">
              You can change this later from your event settings
            </p>

            <div className="flex justify-center mt-4">
              <Button type="button" variant="outline" onClick={handleSkip} disabled={isSubmitting}>
                Skip this step
              </Button>
            </div>
          </>
        )}

        {/* Show Complete Setup button when valid */}
        {selectedOption &&
          (selectedOption === 'create' || (selectedOption === 'own' && uploadedImage)) && (
            <div className="flex justify-center mt-4">
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          )}
      </div>
    </div>
  )
}
