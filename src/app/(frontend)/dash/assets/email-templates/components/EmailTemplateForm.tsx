'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Sparkles, StopCircle, Eye, Code } from 'lucide-react'
import { useEmailGeneration } from '@/hooks/useEmailGeneration'
import { SafeEmailPreview } from '@/components/SafeHTML'

import { emailTemplateSchema, type EmailTemplateFormValues } from '@/lib/schemas/emailTemplate'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type Props =
  | {
      mode: 'create'
      displayMode?: 'simple' | 'advanced'
      organizationId: string | number
      onSuccess?: (data: { id: number; name: string }) => void
      disableRedirect?: boolean
    }
  | {
      mode: 'edit'
      templateId: string
      defaultValues: EmailTemplateFormValues
      displayMode?: 'simple' | 'advanced'
      organizations?: Array<{ id: string | number; name: string }>
      onSuccess?: (data: { id: number; name: string }) => void
      disableRedirect?: boolean
    }

export function EmailTemplateForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  const displayMode = props.displayMode || 'advanced'
  const isSimpleMode = displayMode === 'simple'

  // AI email generation hook
  const {
    content: aiContent,
    isGenerating: isGeneratingAI,
    error: aiError,
    generate: generateAI,
    stop: stopAI,
  } = useEmailGeneration()

  const defaultValues =
    props.mode === 'edit'
      ? props.defaultValues
      : ({
          name: '',
          description: '',
          subject: '',
          htmlBody: '',
          isActive: true,
          triggerEvent: 'none' as const,
          delayMinutes: 0,
        } as EmailTemplateFormValues)

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema) as any,
    defaultValues,
    mode: 'onBlur',
  })

  const triggerEvent = watch('triggerEvent')
  const subject = watch('subject')
  const name = watch('name')
  const htmlBody = watch('htmlBody')

  // Update htmlBody when AI content is generated
  useEffect(() => {
    if (aiContent) {
      setValue('htmlBody', aiContent, { shouldValidate: true, shouldDirty: true })
    }
  }, [aiContent, setValue])

  // Function to handle AI generation
  const handleGenerateAI = async () => {
    await generateAI({
      subject: subject || undefined,
      description: name || undefined,
      triggerEvent: triggerEvent || 'none',
    })
  }

  const onSubmit = async (values: EmailTemplateFormValues) => {
    setServerError(null)
    try {
      const url =
        props.mode === 'edit' ? `/api/email-templates/${props.templateId}` : '/api/email-templates'
      const method = props.mode === 'edit' ? 'PATCH' : 'POST'

      // Convert htmlBody to Lexical format
      const htmlBodyLexical = {
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
              direction: 'ltr',
            },
          ],
          direction: 'ltr',
        },
      }

      const payload = {
        ...values,
        organization: props.mode === 'create' ? props.organizationId : undefined,
        htmlBody: htmlBodyLexical,
        automationTriggers: {
          triggerEvent: values.triggerEvent,
          statusFilter: values.statusFilter,
          customTriggerName: values.customTriggerName,
          delayMinutes: values.delayMinutes,
          conditions: values.conditions,
        },
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`
        throw new Error(message)
      }

      const responseData = await res.json()
      const templateId = responseData.doc?.id || responseData.id
      const templateName = responseData.doc?.name || responseData.name || values.name

      // Call onSuccess callback if provided
      if (props.onSuccess) {
        props.onSuccess({ id: templateId, name: templateName })
      }

      // Only redirect if not disabled
      if (!props.disableRedirect) {
        router.push('/dash/assets/email-templates')
        router.refresh()
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Simple mode header */}
      {isSimpleMode && (
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Create an email template for automated communications
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            You can use variables like {'{'}
            {'{'} firstName {'}'}
            {'}'} and {'{'}
            {'{'} eventName {'}'}
            {'}'} in your template
          </p>
        </div>
      )}

      {/* Basic Information */}
      {!isSimpleMode && (
        <FieldSet>
          <FieldLegend>Basic Information</FieldLegend>
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Template name *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="participant-welcome"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="What this template is used for..."
                    rows={2}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="text-base">
                      Active
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Whether this template is active and can be used
                    </p>
                  </div>
                  <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic" className="text-base">
                      Public Template
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make this template available to all users across all organizations
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="isPremium"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPremium" className="text-base">
                      Premium Template
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require premium subscription to use this template
                    </p>
                  </div>
                  <Switch
                    id="isPremium"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </FieldGroup>
        </FieldSet>
      )}

      {/* Simple mode - Name field */}
      {isSimpleMode && (
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Template name *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="bg-background"
                placeholder="Welcome Email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      {/* Email Content */}
      {!isSimpleMode ? (
        <FieldSet>
          <FieldLegend>Email Content</FieldLegend>
          <FieldGroup>
            <Controller
              name="subject"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email subject *</FieldLabel>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Use {'{'}
                    {'{'} variable {'}'} {'}'} for dynamic content (Handlebars syntax)
                  </p>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="Welcome to {{eventName}}"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="htmlBody"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Email body *</FieldLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        disabled={isSubmitting || isGeneratingAI}
                        className="h-7"
                      >
                        {showPreview ? (
                          <>
                            <Code className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Preview
                          </>
                        )}
                      </Button>
                      {isGeneratingAI ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={stopAI}
                          disabled={isSubmitting}
                          className="h-7"
                        >
                          <StopCircle className="mr-1.5 h-3.5 w-3.5" />
                          Stop
                        </Button>
                      ) : (
                        <RainbowButton
                          onClick={handleGenerateAI}
                          disabled={isSubmitting}
                          className="h-7 text-sm px-3"
                        >
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          Generate with Prevema
                        </RainbowButton>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Use {'{'}
                    {'{'} variable {'}'} {'}'} for dynamic content (Handlebars syntax)
                  </p>
                  {aiError && <p className="text-xs text-destructive">{aiError}</p>}
                  {showPreview ? (
                    <SafeEmailPreview
                      html={htmlBody || ''}
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-border rounded-md p-6 min-h-[300px] prose prose-sm dark:prose-invert max-w-none shadow-sm [&_*]:text-gray-900 dark:[&_*]:text-gray-100"
                    />
                  ) : (
                    <Textarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="bg-background font-mono text-sm"
                      placeholder="Hello {{participantName}}, ..."
                      rows={12}
                      disabled={isGeneratingAI}
                    />
                  )}
                  {isGeneratingAI && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating email content...
                    </p>
                  )}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      ) : (
        <>
          <Controller
            name="subject"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Subject *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Welcome to our event!"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="htmlBody"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Message *</FieldLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      disabled={isSubmitting || isGeneratingAI}
                      className="h-7"
                    >
                      {showPreview ? (
                        <>
                          <Code className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Preview
                        </>
                      )}
                    </Button>
                    {isGeneratingAI ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={stopAI}
                        disabled={isSubmitting}
                        className="h-7"
                      >
                        <StopCircle className="mr-1.5 h-3.5 w-3.5" />
                        Stop
                      </Button>
                    ) : (
                      <RainbowButton
                        onClick={handleGenerateAI}
                        disabled={isSubmitting}
                        className="h-7 text-sm px-3"
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Generate with Prevema
                      </RainbowButton>
                    )}
                  </div>
                </div>
                {aiError && <p className="text-xs text-destructive">{aiError}</p>}
                {showPreview ? (
                  <SafeEmailPreview
                    html={htmlBody || ''}
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-border rounded-md p-6 min-h-[200px] prose prose-sm dark:prose-invert max-w-none shadow-sm [&_*]:text-gray-900 dark:[&_*]:text-gray-100"
                  />
                ) : (
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background font-mono text-sm"
                    placeholder="Enter your email message..."
                    rows={8}
                    disabled={isGeneratingAI}
                  />
                )}
                {isGeneratingAI && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating email content...
                  </p>
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                <p className="text-xs text-muted-foreground">
                  Available variables: firstName, lastName, email, eventName, eventDate,
                  organizationName
                </p>
              </Field>
            )}
          />
        </>
      )}

      {/* Automation Settings - Only in advanced mode */}
      {!isSimpleMode && (
        <FieldSet>
          <FieldLegend>Automation Settings</FieldLegend>
          <FieldGroup>
            <Controller
              name="triggerEvent"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="triggerEvent">Trigger event</FieldLabel>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Select the event that triggers this email template
                  </p>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="triggerEvent"
                      ref={field.ref}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Manual Only</SelectItem>
                      <SelectItem value="participant.created">Participant Created</SelectItem>
                      <SelectItem value="participant.updated">Participant Updated</SelectItem>
                      <SelectItem value="partner.invited">Partner Invited</SelectItem>
                      <SelectItem value="event.published">Event Published</SelectItem>
                      <SelectItem value="form.submitted">Form Submitted</SelectItem>
                      <SelectItem value="custom">Custom Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {triggerEvent === 'custom' && (
              <Controller
                name="customTriggerName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Custom trigger name</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="bg-background"
                      placeholder="my.custom.trigger"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}

            <Controller
              name="delayMinutes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Delay (minutes)</FieldLabel>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Delay in minutes before sending (0 for immediate)
                  </p>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="conditions"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Conditions (JSON)</FieldLabel>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Optional JSON conditions for when to send
                  </p>
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background font-mono text-sm"
                    placeholder='{"fieldName": "value"}'
                    rows={3}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 justify-center">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.mode === 'edit' ? 'Save changes' : 'Save and continue'}
        </Button>
        {!props.disableRedirect && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dash/assets/email-templates')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
