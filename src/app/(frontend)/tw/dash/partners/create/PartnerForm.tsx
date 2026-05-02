'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Field, ErrorMessage, Label } from '@/components/catalyst/fieldset'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Textarea } from '@/components/catalyst/textarea'
import { Text } from '@/components/catalyst/text'
import { partnerSchema, type PartnerFormValues } from '@/lib/schemas/partner'
import { createPartner, updatePartner } from './actions'
import { uploadEventImage } from '../../events/create/actions'

type TypeOption = { id: number; name: string }
type TierOption = { id: number; name: string }

type PartnerFormProps =
  | {
      mode: 'create'
      eventId: number
      eventName: string
      partnerTypes: TypeOption[]
      tiers: TierOption[]
    }
  | {
      mode: 'edit'
      partnerId: string
      eventId: number
      eventName: string
      partnerTypes: TypeOption[]
      tiers: TierOption[]
      defaultValues: PartnerFormValues
      existingLogoUrl?: string | null
    }

function sanitize(data: PartnerFormValues): PartnerFormValues {
  return {
    ...data,
    email: data.email === '' ? null : data.email,
    fieldOfExpertise: data.fieldOfExpertise === '' ? null : data.fieldOfExpertise,
    companyWebsiteUrl: data.companyWebsiteUrl === '' ? null : data.companyWebsiteUrl,
    companyLogoUrl: data.companyLogoUrl === '' ? null : data.companyLogoUrl,
    companyDescription: data.companyDescription === '' ? null : data.companyDescription,
    sponsorshipLevel: data.sponsorshipLevel === '' ? null : data.sponsorshipLevel,
    additionalNotes: data.additionalNotes === '' ? null : data.additionalNotes,
  }
}

export function PartnerForm(props: PartnerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    props.mode === 'edit' ? (props.existingLogoUrl ?? null) : null,
  )
  const [existingLogoRemoved, setExistingLogoRemoved] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultValues: PartnerFormValues =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          companyName: '',
          event: props.eventId,
          partnerType: props.partnerTypes.length === 1 ? props.partnerTypes[0].id : (undefined as any),
          contactPerson: '',
          contactEmail: '',
          email: null,
          fieldOfExpertise: null,
          companyWebsiteUrl: null,
          companyLogo: null,
          companyLogoUrl: null,
          companyBanner: null,
          companyDescription: null,
          tier: null,
          sponsorshipLevel: null,
          status: 'default',
          additionalNotes: null,
        }

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues,
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError(null)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setExistingLogoRemoved(false)
    e.target.value = ''
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setExistingLogoRemoved(true)
    setLogoError(null)
  }

  const onSubmit = (data: PartnerFormValues) => {
    setServerMessage(null)
    setLogoError(null)
    const sanitized = sanitize(data)

    startTransition(async () => {
      let imageId: number | null | undefined = undefined

      if (logoFile) {
        const fd = new FormData()
        fd.set('image', logoFile)
        const uploadResult = await uploadEventImage(fd)
        if (!uploadResult.success) {
          setLogoError(uploadResult.message)
          return
        }
        imageId = uploadResult.imageId
      } else if (props.mode === 'edit' && existingLogoRemoved) {
        imageId = null
      }

      if (props.mode === 'create') {
        const result = await createPartner(sanitized, imageId ?? undefined)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof PartnerFormValues, { type: 'server', message: messages?.[0] })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      } else {
        const result = await updatePartner(props.partnerId, sanitized, imageId)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof PartnerFormValues, { type: 'server', message: messages?.[0] })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      }
    })
  }

  const cancelHref =
    props.mode === 'edit' ? `/tw/dash/partners/${props.partnerId}` : '/tw/dash/partners'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
      <Heading>{props.mode === 'edit' ? 'Edit Partner' : 'New Partner'}</Heading>
      <Divider className="my-10 mt-6" />

      {serverMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {serverMessage}
        </div>
      )}

      {/* Company Logo */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company Logo</Subheading>
          <Text>Upload a logo image. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          {logoPreview ? (
            <div className="flex items-start gap-4">
              <img src={logoPreview} alt="Company logo" className="size-24 rounded-lg object-contain" />
              <div className="space-y-2">
                <Button type="button" outline onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                  Change logo
                </Button>
                <div>
                  <Button type="button" plain onClick={removeLogo} disabled={isPending}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button type="button" outline onClick={() => fileInputRef.current?.click()} disabled={isPending}>
              Upload logo
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleLogoChange}
          />
          {logoError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{logoError}</p>}
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Event (read-only display) */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Event</Subheading>
          <Text>The event this partner is associated with.</Text>
        </div>
        <div>
          <input type="hidden" {...register('event', { valueAsNumber: true })} />
          <p className="py-2 text-sm/6 text-zinc-950 dark:text-white">{props.eventName}</p>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Company details */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company Details</Subheading>
          <Text>Core information about the partner company.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Company name *</Label>
            <Input
              {...register('companyName')}
              placeholder="Acme Corp"
              data-invalid={errors.companyName ? true : undefined}
            />
            {errors.companyName && <ErrorMessage>{errors.companyName.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Partner type *</Label>
            <Controller
              name="partnerType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  data-invalid={errors.partnerType ? true : undefined}
                >
                  <option value="">Select type</option>
                  {props.partnerTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.partnerType && <ErrorMessage>{errors.partnerType.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Tier</Label>
            <Controller
              name="tier"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  data-invalid={errors.tier ? true : undefined}
                >
                  <option value="">No tier</option>
                  {props.tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.tier && <ErrorMessage>{errors.tier.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Status</Label>
            <Select {...register('status')} data-invalid={errors.status ? true : undefined}>
              <option value="default">Default</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </Select>
            {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Field of expertise</Label>
            <Input
              {...register('fieldOfExpertise')}
              placeholder="Software development"
              data-invalid={errors.fieldOfExpertise ? true : undefined}
            />
            {errors.fieldOfExpertise && <ErrorMessage>{errors.fieldOfExpertise.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Website</Label>
            <Input
              {...register('companyWebsiteUrl')}
              placeholder="https://example.com"
              data-invalid={errors.companyWebsiteUrl ? true : undefined}
            />
            {errors.companyWebsiteUrl && <ErrorMessage>{errors.companyWebsiteUrl.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Contact */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Contact</Subheading>
          <Text>Primary contact person for this partnership.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Contact person *</Label>
            <Input
              {...register('contactPerson')}
              placeholder="Jane Smith"
              data-invalid={errors.contactPerson ? true : undefined}
            />
            {errors.contactPerson && <ErrorMessage>{errors.contactPerson.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Contact email *</Label>
            <Input
              {...register('contactEmail')}
              type="email"
              placeholder="jane@example.com"
              data-invalid={errors.contactEmail ? true : undefined}
            />
            {errors.contactEmail && <ErrorMessage>{errors.contactEmail.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>General company email</Label>
            <Input
              {...register('email')}
              type="email"
              placeholder="info@example.com"
              data-invalid={errors.email ? true : undefined}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* About */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>About</Subheading>
          <Text>Additional details about the partnership.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Company description</Label>
            <Textarea
              {...register('companyDescription')}
              placeholder="Brief description of the company…"
              rows={4}
              data-invalid={errors.companyDescription ? true : undefined}
            />
            {errors.companyDescription && <ErrorMessage>{errors.companyDescription.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Sponsorship level</Label>
            <Input
              {...register('sponsorshipLevel')}
              placeholder="Gold, Silver…"
              data-invalid={errors.sponsorshipLevel ? true : undefined}
            />
            {errors.sponsorshipLevel && <ErrorMessage>{errors.sponsorshipLevel.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Additional notes</Label>
            <Textarea
              {...register('additionalNotes')}
              placeholder="Any extra notes…"
              rows={3}
              data-invalid={errors.additionalNotes ? true : undefined}
            />
            {errors.additionalNotes && <ErrorMessage>{errors.additionalNotes.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="button" plain onClick={() => router.push(cancelHref)} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? props.mode === 'edit'
              ? 'Saving…'
              : 'Creating…'
            : props.mode === 'edit'
              ? 'Save changes'
              : 'Create partner'}
        </Button>
      </div>
    </form>
  )
}
