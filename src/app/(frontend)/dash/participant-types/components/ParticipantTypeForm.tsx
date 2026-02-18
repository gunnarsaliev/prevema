'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  participantTypeSchema,
  type ParticipantTypeFormValues,
  PARTICIPANT_FIELD_OPTIONS,
} from '@/lib/schemas/participant-type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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

type OrgOption = { id: number; name: string }
type EventOption = { id: number; name: string }

type Props =
  | { mode: 'create'; organizations: OrgOption[]; events: EventOption[] }
  | { mode: 'edit'; participantTypeId: string; defaultValues: ParticipantTypeFormValues; organizations: OrgOption[]; events: EventOption[] }

export function ParticipantTypeForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const organizations = props.organizations

  const defaultValues: Partial<ParticipantTypeFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          // Auto-select the only org; if multiple, the user will pick via the selector below
          organization: organizations.length === 1 ? organizations[0].id : undefined,
          name: '',
          isActive: true,
          showOptionalFields: false,
          requiredFields: [],
          optionalFields: [],
        }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<ParticipantTypeFormValues>({
    resolver: zodResolver(participantTypeSchema),
    defaultValues,
    mode: 'onBlur',
  })

  // Only re-renders this section when showOptionalFields changes
  const showOptionalFields = useWatch({ control, name: 'showOptionalFields' })
  const requiredFields = useWatch({ control, name: 'requiredFields' }) ?? []

  const onSubmit = async (values: ParticipantTypeFormValues) => {
    setServerError(null)
    try {
      const url =
        props.mode === 'edit'
          ? `/api/participant-types/${props.participantTypeId}`
          : '/api/participant-types'
      const method = props.mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`
        throw new Error(message)
      }

      router.push('/dash/participant-types')
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Organization selector — only shown when the user belongs to 2+ organizations */}
      {props.mode === 'create' && organizations.length >= 2 && (
        <FieldSet>
          <FieldLegend>Organization</FieldLegend>
          <FieldGroup>
            <Controller
              name="organization"
              control={control}
              rules={{ required: 'Please select an organization' }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="organization">Organization *</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger id="organization" ref={field.ref} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={String(org.id)}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      )}

      {/* General */}
      <FieldSet>
        <FieldLegend>General</FieldLegend>
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Speaker"
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
                  placeholder="Describe this participant type…"
                  rows={2}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="event"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event">Link to event</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                  >
                    <SelectTrigger id="event" ref={field.ref} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Any event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any event</SelectItem>
                      {props.events.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="isActive">Active</FieldLabel>
                  <div className="flex items-center gap-2 h-9">
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="text-sm text-muted-foreground">
                      This participant type is accepting registrations
                    </span>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Registration fields */}
      <FieldSet>
        <FieldLegend>Registration fields</FieldLegend>
        <FieldGroup>
          {/* Required fields — checkboxes */}
          <Controller
            name="requiredFields"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Required fields</FieldLabel>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {PARTICIPANT_FIELD_OPTIONS.map((option) => {
                    const checked = field.value?.includes(option.value) ?? false
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const current = field.value ?? []
                            field.onChange(
                              c
                                ? [...current, option.value]
                                : current.filter((v) => v !== option.value),
                            )
                          }}
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Show optional fields toggle */}
          <Controller
            name="showOptionalFields"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showOptionalFields"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor="showOptionalFields" className="cursor-pointer">
                    Enable optional fields
                  </FieldLabel>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, participants see these fields but are not required to fill them in.
                </p>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Optional fields — only shown when showOptionalFields is true */}
          {showOptionalFields && (
            <Controller
              name="optionalFields"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Optional fields</FieldLabel>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Fields already marked as required are automatically excluded.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {PARTICIPANT_FIELD_OPTIONS.map((option) => {
                      const isRequired = requiredFields.includes(option.value)
                      const checked = field.value?.includes(option.value) ?? false
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center gap-2 text-sm ${
                            isRequired ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <Checkbox
                            checked={checked && !isRequired}
                            disabled={isRequired}
                            onCheckedChange={(c) => {
                              if (isRequired) return
                              const current = field.value ?? []
                              field.onChange(
                                c
                                  ? [...current, option.value]
                                  : current.filter((v) => v !== option.value),
                              )
                            }}
                          />
                          {option.label}
                          {isRequired && (
                            <span className="text-xs text-muted-foreground">(required)</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}
        </FieldGroup>
      </FieldSet>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.mode === 'edit' ? 'Save changes' : 'Create participant type'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/participant-types')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
