'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { participantSchema, type ParticipantFormValues } from '@/lib/schemas/participant'
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

type EventOption = { id: number; name: string }
type ParticipantTypeOption = { id: number; name: string }

type SharedOptions = {
  events: EventOption[]
  participantTypes: ParticipantTypeOption[]
  defaultEventId?: number
}

type Props =
  | ({ mode: 'create' } & SharedOptions)
  | ({ mode: 'edit'; participantId: string; defaultValues: ParticipantFormValues } & SharedOptions)

export function ParticipantForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: Partial<ParticipantFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          name: '',
          email: '',
          status: 'not-approved',
          ...(props.defaultEventId ? { event: props.defaultEventId } : {}),
        }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = async (values: ParticipantFormValues) => {
    setServerError(null)
    try {
      const url =
        props.mode === 'edit'
          ? `/api/participants/${props.participantId}`
          : '/api/participants'
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

      router.push('/dash/participants')
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

      {/* Participant */}
      <FieldSet>
        <FieldLegend>Participant</FieldLegend>
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
                  placeholder="Jane Smith"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="jane@example.com"
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
                  <FieldLabel htmlFor="event">Event *</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger id="event" ref={field.ref} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
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
              name="participantType"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="participantType">Participant type *</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger id="participantType" ref={field.ref} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.participantTypes.map((pt) => (
                        <SelectItem key={pt.id} value={String(pt.id)}>
                          {pt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" ref={field.ref} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-approved">Not Approved</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="need-info">Need More Information</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Profile */}
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldGroup>
          <Controller
            name="biography"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Biography</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Brief biography or introduction…"
                  rows={3}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="United States"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    type="tel"
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="+1 555 000 0000"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="companyName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Company name</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="Acme Inc."
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="companyPosition"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Job title</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="Software Engineer"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="companyWebsite"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Company website</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  type="url"
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="https://acme.com"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Notes */}
      <FieldSet>
        <FieldLegend>Notes</FieldLegend>
        <FieldGroup>
          <Controller
            name="internalNotes"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Internal notes</FieldLabel>
                <p className="text-xs text-muted-foreground -mt-1">
                  Not visible to the participant.
                </p>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Internal notes for your team…"
                  rows={2}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="presentationTopic"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Presentation topic</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Topic title…"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="presentationSummary"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Presentation summary</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Brief summary of the presentation…"
                  rows={3}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="technicalRequirements"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Technical requirements</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Any technical requirements…"
                  rows={2}
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
          {props.mode === 'edit' ? 'Save changes' : 'Add participant'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/participants')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
