'use client'

import { useState } from 'react'
import { Image as ImageIcon, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { recordSocialPostPreferenceAction } from '@/app/(frontend)/onboarding/actions'

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
  const [selectedOption, setSelectedOption] = useState<'own' | 'create' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectOption = async (option: 'own' | 'create') => {
    setSelectedOption(option)
    setIsSubmitting(true)

    try {
      await recordSocialPostPreferenceAction(organizationId, option)
      onValidationChange(stepIndex, true)
      if (onPreferenceSelected) {
        onPreferenceSelected(option)
      }
    } catch (error) {
      console.error('Error saving preference:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Social Post Design</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            How would you like to create social post images for participants and partners?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: I have my own */}
          <button
            type="button"
            onClick={() => handleSelectOption('own')}
            disabled={isSubmitting}
            className={`relative p-6 rounded-lg border-2 transition-all hover:border-primary/50 hover:shadow-lg ${
              selectedOption === 'own'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border bg-background'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <ImageIcon className="h-10 w-10 text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">I have my own design</h4>
                <p className="text-sm text-muted-foreground">
                  I'll upload my own social post template or create images manually
                </p>
              </div>
              {selectedOption === 'own' && (
                <div className="absolute top-3 right-3">
                  <div className="rounded-full bg-primary p-1">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Option 2: Create design */}
          <button
            type="button"
            onClick={() => handleSelectOption('create')}
            disabled={isSubmitting}
            className={`relative p-6 rounded-lg border-2 transition-all hover:border-primary/50 hover:shadow-lg ${
              selectedOption === 'create'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border bg-background'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <Palette className="h-10 w-10 text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Create design with our tool</h4>
                <p className="text-sm text-muted-foreground">
                  Use our image generator to create beautiful social post templates
                </p>
              </div>
              {selectedOption === 'create' && (
                <div className="absolute top-3 right-3">
                  <div className="rounded-full bg-primary p-1">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>

        {selectedOption && (
          <div className="mt-6 p-4 rounded-md bg-muted/50 border border-border">
            <p className="text-sm text-foreground">
              {selectedOption === 'own' ? (
                <>
                  Great! You can upload your own images later from the event dashboard. Click "Next" to complete the onboarding.
                </>
              ) : (
                <>
                  Excellent choice! After completing onboarding, you'll be redirected to the image generator tool to create your template.
                </>
              )}
            </p>
          </div>
        )}

        {!selectedOption && (
          <>
            <p className="text-xs text-center text-muted-foreground">
              You can change this later from your event settings
            </p>

            <div className="flex justify-center mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onNext}
                disabled={isSubmitting}
              >
                Skip this step
              </Button>
            </div>
          </>
        )}

        {selectedOption && (
          <div className="flex justify-center mt-4">
            <Button
              type="button"
              onClick={onNext}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
