'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<'own' | 'create' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectOption = (option: 'own' | 'create') => {
    setSelectedOption(option)
    onValidationChange(stepIndex, true)
  }

  const handleNext = async () => {
    if (!selectedOption) return

    setIsSubmitting(true)
    try {
      await recordSocialPostPreferenceAction(organizationId, selectedOption)
      if (onPreferenceSelected) {
        onPreferenceSelected(selectedOption)
      }

      // Redirect to image generator if "create" option was selected
      if (selectedOption === 'create') {
        router.push('/image-generator')
      } else {
        onNext?.()
      }
    } catch (error) {
      console.error('Error saving preference:', error)
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
                <h4 className="font-semibold text-foreground text-lg mb-1">I have my own design</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your own template
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
                <h4 className="font-semibold text-foreground text-lg mb-1">Create design with our tool</h4>
                <p className="text-sm text-muted-foreground">
                  Use our image generator
                </p>
              </div>
            </div>

            {/* Bottom indicator line */}
            {selectedOption === 'create' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />
            )}
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
                onClick={handleSkip}
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
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
