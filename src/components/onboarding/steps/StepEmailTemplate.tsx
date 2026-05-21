'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle2, Loader2, Sparkles, StopCircle, Eye, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { useEmailGeneration } from '@/hooks/useEmailGeneration'
import { SafeEmailPreview } from '@/components/SafeHTML'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject line is required'),
  htmlBody: z.string().min(1, 'Message body is required'),
})

type FormValues = z.infer<typeof formSchema>

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
  const [serverError, setServerError] = useState<string | null>(null)
  const [showBodyPreview, setShowBodyPreview] = useState(false)

  const { content: aiContent, isGenerating, error: aiError, generate, stop } = useEmailGeneration()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  })

  const subjectValue = watch('subject')
  const nameValue = watch('name')
  const htmlBodyValue = watch('htmlBody')

  // Stream AI content into the body field in real time
  useEffect(() => {
    if (aiContent) {
      setValue('htmlBody', aiContent, { shouldValidate: true, shouldDirty: true })
    }
  }, [aiContent, setValue])

  // Auto-switch to preview when AI finishes
  useEffect(() => {
    if (!isGenerating && aiContent) {
      setShowBodyPreview(true)
    }
  }, [isGenerating, aiContent])

  const handleGenerate = () => {
    setShowBodyPreview(true)
    generate({
      subject: subjectValue || undefined,
      description: nameValue || undefined,
      triggerEvent: 'none',
    })
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const lexicalBody = {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'text',
                  format: 0,
                  detail: 0,
                  mode: 'normal',
                  style: '',
                  text: values.htmlBody,
                  version: 1,
                },
              ],
            },
          ],
          direction: 'ltr',
        },
      }

      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          subject: values.subject,
          htmlBody: lexicalBody,
          organization: organizationId,
          isActive: true,
          isPublic: false,
          isPremium: false,
          automationTriggers: { triggerEvent: 'none', delayMinutes: 0 },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`,
        )
      }

      const data = await res.json()
      const templateId = data.doc?.id ?? data.id
      const templateName = data.doc?.name ?? data.name ?? values.name

      onTemplateCreated?.(templateId, templateName)
      setShowSuccess(true)

      setTimeout(() => {
        onNext?.()
      }, 800)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (showSuccess) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/40 p-4">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-base font-semibold text-foreground">Email template created!</p>
          <p className="text-sm text-muted-foreground">Moving to the next step…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-background shadow-lg overflow-hidden">
          {/* Header band */}
          <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-6 py-4">
            <div className="rounded-lg bg-orange-500/15 p-2">
              <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                Welcome email template
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sent automatically when someone registers
              </p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {serverError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            {/* Template name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Template name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Welcome Email"
                className={cn(
                  'bg-background text-foreground placeholder:text-muted-foreground/60',
                  errors.name &&
                    touchedFields.name &&
                    'border-destructive focus-visible:ring-destructive',
                )}
              />
              {errors.name && touchedFields.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                Subject line <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Welcome to {{eventName}}!"
                className={cn(
                  'bg-background text-foreground placeholder:text-muted-foreground/60',
                  errors.subject &&
                    touchedFields.subject &&
                    'border-destructive focus-visible:ring-destructive',
                )}
              />
              {errors.subject && touchedFields.subject && (
                <p className="text-xs text-destructive">{errors.subject.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">
                  {'{{variable}}'}
                </code>{' '}
                for dynamic content
              </p>
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="htmlBody" className="text-sm font-medium text-foreground">
                  Message body <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-1.5">
                  {htmlBodyValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBodyPreview((v) => !v)}
                      disabled={isGenerating}
                      className="h-7 gap-1.5 text-xs text-muted-foreground"
                    >
                      {showBodyPreview ? (
                        <>
                          <Code className="h-3.5 w-3.5" /> Edit
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </>
                      )}
                    </Button>
                  )}
                  {isGenerating ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={stop}
                      className="h-7 gap-1.5 text-xs"
                    >
                      <StopCircle className="h-3.5 w-3.5" />
                      Stop
                    </Button>
                  ) : (
                    <RainbowButton
                      type="button"
                      onClick={handleGenerate}
                      disabled={isSubmitting}
                      className="h-7 text-xs px-3"
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Generate with AI
                    </RainbowButton>
                  )}
                </div>
              </div>
              {aiError && <p className="text-xs text-destructive">{aiError}</p>}
              {showBodyPreview && htmlBodyValue ? (
                <div
                  className={cn(
                    'min-h-[152px] rounded-md border border-border bg-white dark:bg-zinc-900 px-4 py-3 text-sm leading-relaxed overflow-auto',
                    isGenerating && 'opacity-70',
                  )}
                >
                  <SafeEmailPreview html={htmlBodyValue} />
                </div>
              ) : (
                <Textarea
                  id="htmlBody"
                  {...register('htmlBody')}
                  value={htmlBodyValue ?? ''}
                  onChange={(e) => setValue('htmlBody', e.target.value, { shouldDirty: true })}
                  placeholder={`Hi {{firstName}},\n\nThank you for registering for {{eventName}}. We're excited to have you!\n\nBest regards,\n{{organizationName}}`}
                  rows={6}
                  disabled={isGenerating}
                  className={cn(
                    'resize-none bg-background text-sm text-foreground placeholder:text-muted-foreground/60 leading-relaxed transition-opacity',
                    isGenerating && 'opacity-70',
                    errors.htmlBody &&
                      touchedFields.htmlBody &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                />
              )}
              {errors.htmlBody && touchedFields.htmlBody && !showBodyPreview && (
                <p className="text-xs text-destructive">{errors.htmlBody.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Available variables: firstName, lastName, email, eventName, eventDate,
                organizationName
              </p>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating template…' : 'Save & continue'}
            </Button>
          </form>
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={onNext}
          className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
