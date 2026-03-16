'use client'

import { useState, useEffect } from 'react'
import { Building2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  createOrganizationAction,
  updateOrganizationAction,
  getUserOrganizationAction,
} from '@/app/(frontend)/onboarding/actions'

interface StepOrganizationProps {
  stepIndex: number
  onValidationChange: (stepIndex: number, isValid: boolean) => void
  onOrganizationCreated?: (organizationId: number, organizationName: string) => void
  onNext?: () => void
}

export const StepOrganization = ({
  stepIndex,
  onValidationChange,
  onOrganizationCreated,
  onNext,
}: StepOrganizationProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasOrganization, setHasOrganization] = useState(false)
  const [organizationId, setOrganizationId] = useState<number | null>(null)
  const [organizationName, setOrganizationName] = useState('')
  const [emailConfigIsActive, setEmailConfigIsActive] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [resendApiKey, setResendApiKey] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<any>(undefined)

  // Fetch user's default organization on mount
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const result = await getUserOrganizationAction()

        console.log('[StepOrganization] Fetched organization:', result)

        if (result.success && result.data) {
          const org = result.data

          setHasOrganization(true)
          setOrganizationId(org.id)
          setOrganizationName(org.name || '')

          // Pre-populate email config if it exists
          if (org.emailConfig) {
            setEmailConfigIsActive(org.emailConfig.isActive || false)
            setSenderName(org.emailConfig.senderName || '')
            setFromEmail(org.emailConfig.fromEmail || '')
            setReplyToEmail(org.emailConfig.replyToEmail || '')
            setResendApiKey(org.emailConfig.resendApiKey || '')
          }

          // Mark as valid if name exists
          const isValid = (org.name || '').trim().length >= 3
          onValidationChange(stepIndex, isValid)
        } else {
          // No organization found - user needs to create one
          console.log('[StepOrganization] No organization found - showing create form')
          setHasOrganization(false)
          onValidationChange(stepIndex, false)
        }
      } catch (error) {
        console.error('[StepOrganization] Error fetching organization:', error)
        setHasOrganization(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganization()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    setIsPending(true)

    try {
      let result

      if (hasOrganization && organizationId) {
        // Update existing organization
        result = await updateOrganizationAction(organizationId, state, formData)
        console.log('[StepOrganization] Organization updated successfully')
      } else {
        // Create new organization
        result = await createOrganizationAction(state, formData)
        console.log('[StepOrganization] Organization created successfully')

        // Update local state with new organization
        if (result.success && result.data) {
          setHasOrganization(true)
          setOrganizationId(result.data.id)
        }
      }

      setState(result)

      if (result.success && result.data) {
        // Notify parent of organization creation
        if (onOrganizationCreated) {
          onOrganizationCreated(result.data.id, result.data.name)
        }

        // Auto-advance to next step after showing success message
        setTimeout(() => {
          console.log('[StepOrganization] Calling onNext to advance...', { onNext })
          onNext?.()
        }, 1500)
      } else {
        console.error('[StepOrganization] Operation failed:', result.message)
      }
    } catch (error) {
      console.error('[StepOrganization] Error submitting form:', error)
      setState({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsPending(false)
    }
  }

  // Update validation when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setOrganizationName(value)
    onValidationChange(stepIndex, value.trim().length >= 3)
  }

  // Show loading state while fetching organization
  if (isLoading) {
    return (
      <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Loading organization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        {/* Success message */}
        {state?.success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              Organization "{state.data?.name}" {hasOrganization ? 'updated' : 'created'} successfully!
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
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Let's start by setting up your organization
              </p>
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Organization name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Acme Inc."
                value={organizationName}
                onChange={handleNameChange}
                required
                minLength={3}
                className="bg-background"
                disabled={isPending}
                aria-invalid={!!state?.errors?.name}
              />
              {state?.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will be the name of your organization or company
              </p>
            </div>

            {/* Collapsible Email Configuration */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="email-config" className="border-border">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  Email Configuration (Optional)
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Configure Resend integration to send automated emails to your participants
                  </p>

                  {/* Email Active Toggle */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailConfigIsActive"
                      name="emailConfigIsActive"
                      checked={emailConfigIsActive}
                      onCheckedChange={(checked) => setEmailConfigIsActive(checked === true)}
                      value={emailConfigIsActive ? 'true' : 'false'}
                    />
                    <Label htmlFor="emailConfigIsActive" className="text-sm text-foreground cursor-pointer">
                      Enable email sending
                    </Label>
                  </div>

                  {/* Resend API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="resendApiKey" className="text-sm text-foreground">
                      Resend API Key
                    </Label>
                    <Input
                      id="resendApiKey"
                      name="resendApiKey"
                      type="password"
                      placeholder="re_..."
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      className="bg-background"
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from{' '}
                      <a
                        href="https://resend.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        resend.com/api-keys
                      </a>
                    </p>
                  </div>

                  {/* Sender Name */}
                  <div className="space-y-2">
                    <Label htmlFor="senderName" className="text-sm text-foreground">
                      Sender Name
                    </Label>
                    <Input
                      id="senderName"
                      name="senderName"
                      type="text"
                      placeholder="Acme Events"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="bg-background"
                      disabled={isPending}
                    />
                  </div>

                  {/* From Email */}
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail" className="text-sm text-foreground">
                      From Email
                    </Label>
                    <Input
                      id="fromEmail"
                      name="fromEmail"
                      type="email"
                      placeholder="noreply@yourdomain.com"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      className="bg-background"
                      disabled={isPending}
                      aria-invalid={!!state?.errors?.['emailConfig.fromEmail']}
                    />
                    {state?.errors?.['emailConfig.fromEmail'] && (
                      <p className="text-sm text-destructive">{state.errors['emailConfig.fromEmail'][0]}</p>
                    )}
                  </div>

                  {/* Reply-To Email */}
                  <div className="space-y-2">
                    <Label htmlFor="replyToEmail" className="text-sm text-foreground">
                      Reply-To Email
                    </Label>
                    <Input
                      id="replyToEmail"
                      name="replyToEmail"
                      type="email"
                      placeholder="support@yourdomain.com"
                      value={replyToEmail}
                      onChange={(e) => setReplyToEmail(e.target.value)}
                      className="bg-background"
                      disabled={isPending}
                      aria-invalid={!!state?.errors?.['emailConfig.replyToEmail']}
                    />
                    {state?.errors?.['emailConfig.replyToEmail'] && (
                      <p className="text-sm text-destructive">{state.errors['emailConfig.replyToEmail'][0]}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || organizationName.trim().length < 3}
            >
              {isPending ? 'Saving...' : 'Save & Continue'}
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
