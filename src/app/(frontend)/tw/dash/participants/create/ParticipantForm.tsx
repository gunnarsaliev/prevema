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
import { participantSchema, type ParticipantFormValues } from '@/lib/schemas/participant'
import { createParticipant, updateParticipant } from './actions'
import { uploadEventImage } from '../../events/create/actions'

type RoleOption = { id: number; name: string }

type ParticipantFormProps =
  | {
      mode: 'create'
      eventId: number
      eventName: string
      participantRoles: RoleOption[]
    }
  | {
      mode: 'edit'
      participantId: string
      eventId: number
      eventName: string
      participantRoles: RoleOption[]
      defaultValues: ParticipantFormValues
      existingPhotoUrl?: string | null
    }

function sanitize(data: ParticipantFormValues): ParticipantFormValues {
  return {
    ...data,
    biography: data.biography === '' ? null : data.biography,
    country: data.country === '' ? null : data.country,
    phoneNumber: data.phoneNumber === '' ? null : data.phoneNumber,
    companyName: data.companyName === '' ? null : data.companyName,
    companyPosition: data.companyPosition === '' ? null : data.companyPosition,
    companyWebsite: data.companyWebsite === '' ? null : data.companyWebsite,
    internalNotes: data.internalNotes === '' ? null : data.internalNotes,
    presentationTopic: data.presentationTopic === '' ? null : data.presentationTopic,
    presentationSummary: data.presentationSummary === '' ? null : data.presentationSummary,
    technicalRequirements: data.technicalRequirements === '' ? null : data.technicalRequirements,
  }
}

export function ParticipantForm(props: ParticipantFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    props.mode === 'edit' ? (props.existingPhotoUrl ?? null) : null,
  )
  const [existingPhotoRemoved, setExistingPhotoRemoved] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultValues: ParticipantFormValues =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          name: '',
          email: '',
          event: props.eventId,
          participantRole:
            props.participantRoles.length === 1
              ? props.participantRoles[0].id
              : (undefined as any),
          status: 'not-approved',
          imageUrl: null,
          biography: null,
          country: null,
          phoneNumber: null,
          companyLogoUrl: null,
          companyName: null,
          companyPosition: null,
          companyWebsite: null,
          internalNotes: null,
          presentationTopic: null,
          presentationSummary: null,
          technicalRequirements: null,
        }

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues,
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setExistingPhotoRemoved(false)
    e.target.value = ''
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setExistingPhotoRemoved(true)
    setPhotoError(null)
  }

  const onSubmit = (data: ParticipantFormValues) => {
    setServerMessage(null)
    setPhotoError(null)
    const sanitized = sanitize(data)

    startTransition(async () => {
      let imageId: number | null | undefined = undefined

      if (photoFile) {
        const fd = new FormData()
        fd.set('image', photoFile)
        const uploadResult = await uploadEventImage(fd)
        if (!uploadResult.success) {
          setPhotoError(uploadResult.message)
          return
        }
        imageId = uploadResult.imageId
      } else if (props.mode === 'edit' && existingPhotoRemoved) {
        imageId = null
      }

      if (props.mode === 'create') {
        const result = await createParticipant(sanitized, imageId ?? undefined)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof ParticipantFormValues, { type: 'server', message: messages?.[0] })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      } else {
        const result = await updateParticipant(props.participantId, sanitized, imageId)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof ParticipantFormValues, { type: 'server', message: messages?.[0] })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      }
    })
  }

  const cancelHref =
    props.mode === 'edit'
      ? `/tw/dash/participants/${props.participantId}`
      : '/tw/dash/participants'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
      <Heading>{props.mode === 'edit' ? 'Edit Participant' : 'New Participant'}</Heading>
      <Divider className="my-10 mt-6" />

      {serverMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {serverMessage}
        </div>
      )}

      {/* Photo */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile Photo</Subheading>
          <Text>Upload a headshot or profile photo. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          {photoPreview ? (
            <div className="flex items-start gap-4">
              <img src={photoPreview} alt="Profile photo" className="size-24 rounded-full object-cover" />
              <div className="space-y-2">
                <Button type="button" outline onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                  Change photo
                </Button>
                <div>
                  <Button type="button" plain onClick={removePhoto} disabled={isPending}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button type="button" outline onClick={() => fileInputRef.current?.click()} disabled={isPending}>
              Upload photo
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
          {photoError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{photoError}</p>}
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Event (read-only display) */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Event</Subheading>
          <Text>The event this participant is registered for.</Text>
        </div>
        <div>
          <input type="hidden" {...register('event', { valueAsNumber: true })} />
          <p className="py-2 text-sm/6 text-zinc-950 dark:text-white">{props.eventName}</p>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Identity */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Identity</Subheading>
          <Text>Basic details about the participant.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Name *</Label>
            <Input
              {...register('name')}
              placeholder="Jane Smith"
              data-invalid={errors.name ? true : undefined}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Email *</Label>
            <Input
              {...register('email')}
              type="email"
              placeholder="jane@example.com"
              data-invalid={errors.email ? true : undefined}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Role *</Label>
            <Controller
              name="participantRole"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  data-invalid={errors.participantRole ? true : undefined}
                >
                  <option value="">Select role</option>
                  {props.participantRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.participantRole && <ErrorMessage>{errors.participantRole.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Status</Label>
            <Select {...register('status')} data-invalid={errors.status ? true : undefined}>
              <option value="not-approved">Not Approved</option>
              <option value="approved">Approved</option>
              <option value="need-info">Need Info</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Profile */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile</Subheading>
          <Text>Personal and contact details.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Country</Label>
            <Input
              {...register('country')}
              placeholder="Germany"
              data-invalid={errors.country ? true : undefined}
            />
            {errors.country && <ErrorMessage>{errors.country.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Phone number</Label>
            <Input
              {...register('phoneNumber')}
              placeholder="+49 123 456789"
              data-invalid={errors.phoneNumber ? true : undefined}
            />
            {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Biography</Label>
            <Textarea
              {...register('biography')}
              placeholder="A brief bio…"
              rows={4}
              data-invalid={errors.biography ? true : undefined}
            />
            {errors.biography && <ErrorMessage>{errors.biography.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Company */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company</Subheading>
          <Text>Professional affiliation.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Company name</Label>
            <Input
              {...register('companyName')}
              placeholder="Acme Corp"
              data-invalid={errors.companyName ? true : undefined}
            />
            {errors.companyName && <ErrorMessage>{errors.companyName.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Position / title</Label>
            <Input
              {...register('companyPosition')}
              placeholder="Software Engineer"
              data-invalid={errors.companyPosition ? true : undefined}
            />
            {errors.companyPosition && <ErrorMessage>{errors.companyPosition.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Company website</Label>
            <Input
              {...register('companyWebsite')}
              placeholder="https://example.com"
              data-invalid={errors.companyWebsite ? true : undefined}
            />
            {errors.companyWebsite && <ErrorMessage>{errors.companyWebsite.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Presentation */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Presentation</Subheading>
          <Text>Speaker or presenter details (if applicable).</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Topic</Label>
            <Input
              {...register('presentationTopic')}
              placeholder="The future of AI"
              data-invalid={errors.presentationTopic ? true : undefined}
            />
            {errors.presentationTopic && <ErrorMessage>{errors.presentationTopic.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Summary</Label>
            <Textarea
              {...register('presentationSummary')}
              placeholder="A summary of the presentation…"
              rows={3}
              data-invalid={errors.presentationSummary ? true : undefined}
            />
            {errors.presentationSummary && <ErrorMessage>{errors.presentationSummary.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Technical requirements</Label>
            <Textarea
              {...register('technicalRequirements')}
              placeholder="HDMI adapter, whiteboard…"
              rows={2}
              data-invalid={errors.technicalRequirements ? true : undefined}
            />
            {errors.technicalRequirements && <ErrorMessage>{errors.technicalRequirements.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Internal */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Internal notes</Subheading>
          <Text>Not visible to the participant.</Text>
        </div>
        <div>
          <Field>
            <Textarea
              {...register('internalNotes')}
              placeholder="Internal notes…"
              rows={3}
              data-invalid={errors.internalNotes ? true : undefined}
            />
            {errors.internalNotes && <ErrorMessage>{errors.internalNotes.message}</ErrorMessage>}
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
              : 'Create participant'}
        </Button>
      </div>
    </form>
  )
}
