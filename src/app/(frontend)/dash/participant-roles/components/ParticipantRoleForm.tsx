'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import slugify from 'slugify'

import {
  participantRoleSchema,
  type ParticipantRoleFormValues,
  PARTICIPANT_FIELD_OPTIONS,
} from '@/lib/schemas/participant-role'
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

type SharedCallbacks = {
  onSuccess?: (newRoleId?: number) => void
  onCancel?: () => void
  lockedValues?: { organization?: number; event?: number }
}

type Props =
  | ({ mode: 'create'; organizations: OrgOption[] } & SharedCallbacks)
  | ({
      mode: 'edit'
      participantRoleId: string
      defaultValues: ParticipantRoleFormValues
      organizations: OrgOption[]
    } & SharedCallbacks)

export function ParticipantRoleForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const organizations = props.organizations

  const defaultValues: Partial<ParticipantRoleFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          organization:
            props.lockedValues?.organization ??
            (organizations.length === 1 ? organizations[0].id : undefined),
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
  } = useForm<ParticipantRoleFormValues>({
    resolver: zodResolver(participantRoleSchema),
    defaultValues,
    mode: 'onBlur',
  })

  // Only re-renders this section when showOptionalFields changes
  const showOptionalFields = useWatch({ control, name: 'showOptionalFields' })
  const requiredFields = useWatch({ control, name: 'requiredFields' }) ?? []

  const onSubmit = async (values: ParticipantRoleFormValues) => {
    setServerError(null)
    try {
      const url =
        props.mode === 'edit'
          ? `/api/participant-roles/${props.participantRoleId}`
          : '/api/participant-roles'
      const method = props.mode === 'edit' ? 'PATCH' : 'POST'

      // Generate slug from name
      const slug = slugify(values.name, { lower: true, strict: true, locale: 'en' })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, slug }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`
        throw new Error(message)
      }

      if (props.onSuccess) {
        const data = await res.json().catch(() => ({}))
        props.onSuccess(data?.doc?.id)
        router.refresh()
      } else {
        router.push('/dash/participant-roles')
        router.refresh()
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl w-full">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Organization selector — hidden when locked (e.g. from event detail drawer) */}
      {!props.lockedValues?.organization &&
        props.mode === 'create' &&
        organizations.length >= 2 && (
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
                      <SelectTrigger
                        id="organization"
                        ref={field.ref}
                        aria-invalid={fieldState.invalid}
                      >
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
                  placeholder="Describe this participant role…"
                  rows={2}
                />
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
                    This participant role is accepting registrations
                  </span>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
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
            render={({ field, fieldState }) => {
              const allFieldValues = PARTICIPANT_FIELD_OPTIONS.map((opt) => opt.value)
              const allSelected = allFieldValues.every((val) => field.value?.includes(val))

              return (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Required fields</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (allSelected) {
                          field.onChange([])
                        } else {
                          field.onChange(allFieldValues)
                        }
                      }}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
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
              )
            }}
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
          {props.mode === 'edit' ? 'Save changes' : 'Create participant role'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            props.onCancel ? props.onCancel() : router.push('/dash/participant-roles')
          }
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
