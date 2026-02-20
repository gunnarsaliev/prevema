'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  emailTemplateSchema,
  type EmailTemplateFormValues,
} from '@/lib/schemas/emailTemplate'
import { Button } from '@/components/ui/button'
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
  | { mode: 'create' }
  | { mode: 'edit'; templateId: string; defaultValues: EmailTemplateFormValues }

export function EmailTemplateForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

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
    formState: { isSubmitting },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema) as any,
    defaultValues,
    mode: 'onBlur',
  })

  const triggerEvent = watch('triggerEvent')

  const onSubmit = async (values: EmailTemplateFormValues) => {
    setServerError(null)
    try {
      const url =
        props.mode === 'edit'
          ? `/api/email-templates/${props.templateId}`
          : '/api/email-templates'
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

      router.push('/dash/assets/email-templates')
      router.refresh()
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

      {/* Basic Information */}
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
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Email Content */}
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
                <FieldLabel htmlFor={field.name}>Email body *</FieldLabel>
                <p className="text-xs text-muted-foreground -mt-1">
                  Use {'{'}
                  {'{'} variable {'}'} {'}'} for dynamic content (Handlebars syntax)
                </p>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background font-mono text-sm"
                  placeholder="Hello {{participantName}}, ..."
                  rows={12}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Automation Settings */}
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
                  <SelectTrigger id="triggerEvent" ref={field.ref} aria-invalid={fieldState.invalid}>
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.mode === 'edit' ? 'Save changes' : 'Create template'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/assets/email-templates')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
