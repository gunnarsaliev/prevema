'use client'

import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import { PARTICIPANT_FIELD_OPTIONS } from '@/lib/schemas/participant-role'
import { quickCreateParticipantRole } from './actions'
import type { CreatedOption } from '../../components/CreateOptionDrawer'

const drawerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  requiredFields: z.array(z.string()),
  showOptionalFields: z.boolean(),
  optionalFields: z.array(z.string()),
})
type DrawerValues = z.infer<typeof drawerSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (item: CreatedOption) => void
}

export function CreateParticipantRoleDrawer({ open, onOpenChange, onCreated }: Props) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<DrawerValues>({
    resolver: zodResolver(drawerSchema),
    defaultValues: { name: '', requiredFields: [], showOptionalFields: false, optionalFields: [] },
  })

  const showOptionalFields = useWatch({ control, name: 'showOptionalFields' })
  const requiredFields = useWatch({ control, name: 'requiredFields' }) ?? []

  const handleClose = () => {
    if (isSubmitting) return
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (values: DrawerValues) => {
    const result = await quickCreateParticipantRole(values)
    if (result.success) {
      onCreated(result.item)
      reset()
      onOpenChange(false)
    } else {
      setError('name', { message: result.message })
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>New Role</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pt-4"
        >
          {/* General */}
          <FieldSet>
            <FieldLegend>General</FieldLegend>
            <FieldGroup>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="role-name">Name *</FieldLabel>
                    <Input
                      {...field}
                      id="role-name"
                      aria-invalid={fieldState.invalid}
                      className="bg-background"
                      placeholder="Speaker"
                      autoFocus
                    />
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
              {/* Required fields */}
              <Controller
                name="requiredFields"
                control={control}
                render={({ field, fieldState }) => {
                  const allValues = PARTICIPANT_FIELD_OPTIONS.map((o) => o.value)
                  const allSelected = allValues.every((v) => field.value?.includes(v))
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel>Required fields</FieldLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => field.onChange(allSelected ? [] : allValues)}
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
                              className="flex cursor-pointer items-center gap-2 text-sm"
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
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="role-showOptional"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FieldLabel htmlFor="role-showOptional" className="cursor-pointer">
                        Enable optional fields
                      </FieldLabel>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When enabled, participants see these fields but are not required to fill them
                      in.
                    </p>
                  </Field>
                )}
              />

              {/* Optional fields — conditional */}
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
                              className={`flex items-center gap-2 text-sm ${isRequired ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
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

          <div className="mt-auto flex justify-end gap-3 pb-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
