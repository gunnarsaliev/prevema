'use client'

import { useState, useActionState, startTransition, useEffect } from 'react'
import { Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createEmailTemplateAction } from '@/app/(frontend)/onboarding/actions'

interface StepEmailTemplateProps {
  stepIndex: number
  onValidationChange: (stepIndex: number, isValid: boolean) => void
  organizationId: number
  eventName?: string
  onTemplateCreated?: (templateId: number, templateName: string) => void
  onNext?: () => void
}

export const StepEmailTemplate = ({
  stepIndex,
  onValidationChange,
  organizationId,
  eventName,
  onTemplateCreated,
  onNext,
}: StepEmailTemplateProps) => {
  const [templateName, setTemplateName] = useState('Welcome Email')
  const [subject, setSubject] = useState(`Welcome to ${eventName || 'our event'}!`)
  const [htmlBody, setHtmlBody] = useState(
    `Hi {{firstName}},\n\nThank you for registering for ${eventName || '{{eventName}}'}!\n\nWe're excited to have you join us.\n\nBest regards,\n{{organizationName}} Team`
  )

  const boundAction = createEmailTemplateAction.bind(null, organizationId)
  const [state, formAction, isPending] = useActionState(boundAction, undefined)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(() => {
      formAction(formData)
    })
  }

  // Update validation when required fields change
  const updateValidation = () => {
    const isValid = subject.trim().length >= 3 && htmlBody.trim().length >= 10
    onValidationChange(stepIndex, isValid)
  }

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
    updateValidation()
  }

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlBody(e.target.value)
    updateValidation()
  }

  // Handle successful template creation and auto-advance
  useEffect(() => {
    if (state?.success && state?.data && !isPending) {
      if (onTemplateCreated) {
        onTemplateCreated(state.data.id, state.data.name)
      }
      // Auto-advance to next step after a short delay
      const timer = setTimeout(() => {
        onNext?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state?.success, state?.data, isPending, onTemplateCreated, onNext])

  return (
    <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        {/* Success message */}
        {state?.success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              Email template "{state.data?.name}" created successfully!
            </p>
          </div>
        )}

        {/* Error message */}
        {state?.message && !state.success && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        {!state?.success && (
          <>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Create a welcome email template
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                You can use variables like {'{'}{'{'} firstName {'}'}{'}'}  and {'{'}{'{'} eventName {'}'}{'}'}
              </p>
            </div>

            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Template name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="bg-background"
                disabled={isPending}
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground">
                Subject *
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="Welcome to our event!"
                value={subject}
                onChange={handleSubjectChange}
                required
                minLength={3}
                className="bg-background"
                disabled={isPending}
                aria-invalid={!!state?.errors?.subject}
              />
              {state?.errors?.subject && (
                <p className="text-sm text-destructive">{state.errors.subject[0]}</p>
              )}
            </div>

            {/* Email Body */}
            <div className="space-y-2">
              <Label htmlFor="htmlBody" className="text-foreground">
                Message *
              </Label>
              <Textarea
                id="htmlBody"
                name="htmlBody"
                placeholder="Enter your email message..."
                value={htmlBody}
                onChange={handleBodyChange}
                required
                minLength={10}
                rows={8}
                className="bg-background font-mono text-sm"
                disabled={isPending}
                aria-invalid={!!state?.errors?.htmlBody}
              />
              {state?.errors?.htmlBody && (
                <p className="text-sm text-destructive">{state.errors.htmlBody[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Available variables: firstName, lastName, email, eventName, eventDate, organizationName
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || subject.trim().length < 3 || htmlBody.trim().length < 10}
            >
              {isPending ? 'Creating...' : 'Create Email Template'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onNext}
              disabled={isPending}
            >
              Skip for now
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
