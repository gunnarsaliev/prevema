'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { partnerSchema, type PartnerFormValues } from '@/lib/schemas/partner'
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
type PartnerTypeOption = { id: number; name: string }
type TierOption = { id: number; name: string }

type SharedOptions = {
  events: EventOption[]
  partnerTypes: PartnerTypeOption[]
  tiers: TierOption[]
}

type Props =
  | ({ mode: 'create' } & SharedOptions)
  | ({ mode: 'edit'; partnerId: string; defaultValues: PartnerFormValues } & SharedOptions)

export function PartnerForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: Partial<PartnerFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          companyName: '',
          contactPerson: '',
          contactEmail: '',
          status: 'default',
        }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = async (values: PartnerFormValues) => {
    setServerError(null)
    try {
      const url = props.mode === 'edit' ? `/api/partners/${props.partnerId}` : '/api/partners'
      const method = props.mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        // Payload REST shape: { errors: [{ message }] }
        // Custom route shape: { error: string }
        const message =
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`
        throw new Error(message)
      }

      router.push('/dash/partners')
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

      {/* Company */}
      <FieldSet>
        <FieldLegend>Company</FieldLegend>
        <FieldGroup>
          <Controller
            name="companyName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Company name *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Acme Inc."
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
              name="partnerType"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="partnerType">Partner type *</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger id="partnerType" ref={field.ref} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.partnerTypes.map((pt) => (
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
        </FieldGroup>
      </FieldSet>

      {/* Contact */}
      <FieldSet>
        <FieldLegend>Contact</FieldLegend>
        <FieldGroup>
          <Controller
            name="contactPerson"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Contact person *</FieldLabel>
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

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="contactEmail"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Contact email *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="jane@acme.com"
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
                  <FieldLabel htmlFor={field.name}>Company email</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="info@acme.com"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Company details */}
      <FieldSet>
        <FieldLegend>Company details</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="fieldOfExpertise"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Field of expertise</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="Software engineering"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="companyWebsiteUrl"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Website URL</FieldLabel>
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
          </div>

          <Controller
            name="companyLogoUrl"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Logo URL</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="https://acme.com/logo.png"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="companyDescription"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Company description</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Brief description of the company and its services…"
                  rows={3}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Partnership */}
      <FieldSet>
        <FieldLegend>Partnership</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="tier"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tier">Tier</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  >
                    <SelectTrigger id="tier" ref={field.ref} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.tiers.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="sponsorshipLevel"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Sponsorship level</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="Gold"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

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
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="additionalNotes"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Additional notes</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Any additional notes…"
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
          {props.mode === 'edit' ? 'Save changes' : 'Add partner'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/partners')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
