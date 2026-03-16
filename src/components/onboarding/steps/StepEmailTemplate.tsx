'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmailTemplateForm } from '@/app/(frontend)/dash/assets/email-templates/components/EmailTemplateForm'

interface StepEmailTemplateProps {
  organizationId: number
  onTemplateCreated?: (templateId: number, templateName: string) => void
  onNext?: () => void
}

export const StepEmailTemplate = ({
  organizationId,
  onTemplateCreated,
  onNext,
}: StepEmailTemplateProps) => {
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSuccess = (data: { id: number; name: string }) => {
    console.log('[StepEmailTemplate] Email template created:', data)

    // Show success message
    setSuccessMessage(`Email template "${data.name}" created successfully!`)
    setShowSuccess(true)

    // Notify parent of template creation
    if (onTemplateCreated) {
      onTemplateCreated(data.id, data.name)
    }

    // Auto-advance to next step after showing success message
    setTimeout(() => {
      console.log('[StepEmailTemplate] Calling onNext to advance...', { onNext })
      onNext?.()
    }, 1500)
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        {/* Success message */}
        {showSuccess && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-3 mb-6">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {!showSuccess && (
          <>
            <EmailTemplateForm
              mode="create"
              displayMode="simple"
              organizationId={organizationId}
              onSuccess={handleSuccess}
              disableRedirect={true}
            />

            <Button type="button" variant="ghost" className="w-full mt-4" onClick={onNext}>
              Skip for now
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
