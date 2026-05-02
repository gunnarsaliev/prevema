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
import { eventSchema, type EventFormValues } from '@/lib/schemas/event'
import { createEvent, updateEvent, uploadEventImage } from './actions'

type OrgOption = { id: number; name: string }

type EventFormProps =
  | { mode: 'create'; organizations: OrgOption[] }
  | {
      mode: 'edit'
      eventId: string
      defaultValues: EventFormValues
      existingImageUrl?: string | null
    }

function sanitizeEventData(data: EventFormValues): EventFormValues {
  return {
    ...data,
    endDate: data.endDate === '' ? null : data.endDate,
    timezone: data.timezone === '' ? null : data.timezone,
    description: data.description === '' ? null : data.description,
    address: data.address === '' ? null : data.address,
    why: data.why === '' ? null : data.why,
    what: data.what === '' ? null : data.what,
    where: data.where === '' ? null : data.where,
    who: data.who === '' ? null : data.who,
    theme: data.theme === '' ? null : data.theme,
  }
}

export function EventForm(props: EventFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    props.mode === 'edit' ? (props.existingImageUrl ?? null) : null,
  )
  const [existingImageRemoved, setExistingImageRemoved] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const organizations = props.mode === 'create' ? props.organizations : []
  const defaultValues: EventFormValues =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          name: '',
          status: 'planning',
          startDate: '',
          endDate: null,
          timezone: null,
          eventType: 'online',
          address: null,
          description: null,
          why: null,
          what: null,
          where: null,
          who: null,
          theme: null,
          organization: organizations.length === 1 ? organizations[0].id : undefined,
        }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setExistingImageRemoved(false)
    e.target.value = ''
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setExistingImageRemoved(true)
    setImageError(null)
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  })

  const eventType = watch('eventType')

  const onSubmit = (data: EventFormValues) => {
    setServerMessage(null)
    setImageError(null)
    const sanitized = sanitizeEventData(data)

    startTransition(async () => {
      let imageId: number | null | undefined = undefined

      if (imageFile) {
        const fd = new FormData()
        fd.set('image', imageFile)
        const uploadResult = await uploadEventImage(fd)
        if (!uploadResult.success) {
          setImageError(uploadResult.message)
          return
        }
        imageId = uploadResult.imageId
      } else if (props.mode === 'edit' && existingImageRemoved) {
        imageId = null
      }

      if (props.mode === 'create') {
        const result = await createEvent(sanitized, imageId ?? undefined)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof EventFormValues, {
                type: 'server',
                message: messages?.[0],
              })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      } else {
        const result = await updateEvent(props.eventId, sanitized, imageId)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof EventFormValues, {
                type: 'server',
                message: messages?.[0],
              })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      }
    })
  }

  const cancelHref = props.mode === 'edit' ? `/tw/dash/events/${props.eventId}` : '/tw/dash/events'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
      <Heading>{props.mode === 'edit' ? 'Edit Event' : 'New Event'}</Heading>
      <Divider className="my-10 mt-6" />

      {serverMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {serverMessage}
        </div>
      )}

      {/* Event Image */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Event Image</Subheading>
          <Text>Upload a cover image for your event. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          {imagePreview ? (
            <div className="flex items-start gap-4">
              <img
                src={imagePreview}
                alt="Event image"
                className="size-24 rounded-lg object-cover"
              />
              <div className="space-y-2">
                <Button
                  type="button"
                  outline
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  Change image
                </Button>
                <div>
                  <Button type="button" plain onClick={removeImage} disabled={isPending}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              outline
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              Upload image
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          {imageError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{imageError}</p>
          )}
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Organization — only shown in create mode when user belongs to 2+ orgs */}
      {props.mode === 'create' && organizations.length >= 2 && (
        <>
          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Subheading>Organization</Subheading>
              <Text>Select the organization this event belongs to.</Text>
            </div>
            <div>
              <Field>
                <Label>Organization *</Label>
                <Controller
                  name="organization"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-invalid={errors.organization ? true : undefined}
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.organization && <ErrorMessage>{errors.organization.message}</ErrorMessage>}
              </Field>
            </div>
          </section>
          <Divider className="my-10" soft />
        </>
      )}

      {/* Basic details */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Event Details</Subheading>
          <Text>Core information about your event.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Event name *</Label>
            <Input
              {...register('name')}
              placeholder="My Event"
              data-invalid={errors.name ? true : undefined}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Start date *</Label>
              <Input
                type="datetime-local"
                {...register('startDate')}
                data-invalid={errors.startDate ? true : undefined}
              />
              {errors.startDate && <ErrorMessage>{errors.startDate.message}</ErrorMessage>}
            </Field>

            <Field>
              <Label>End date</Label>
              <Input
                type="datetime-local"
                {...register('endDate')}
                data-invalid={errors.endDate ? true : undefined}
              />
              {errors.endDate && <ErrorMessage>{errors.endDate.message}</ErrorMessage>}
            </Field>
          </div>

          <Field>
            <Label>Status</Label>
            <Select {...register('status')} data-invalid={errors.status ? true : undefined}>
              <option value="planning">Planning</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </Select>
            {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Event type</Label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select {...field} data-invalid={errors.eventType ? true : undefined}>
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                </Select>
              )}
            />
            {errors.eventType && <ErrorMessage>{errors.eventType.message}</ErrorMessage>}
          </Field>

          {eventType === 'physical' && (
            <Field>
              <Label>Address</Label>
              <Input
                {...register('address')}
                placeholder="123 Main St, City"
                data-invalid={errors.address ? true : undefined}
              />
              {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
            </Field>
          )}

          <Field>
            <Label>Theme / tagline</Label>
            <Input
              {...register('theme')}
              placeholder="Inspiring the future of tech"
              data-invalid={errors.theme ? true : undefined}
            />
            {errors.theme && <ErrorMessage>{errors.theme.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Description */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Description</Subheading>
          <Text>A brief overview of what the event is about.</Text>
        </div>
        <div>
          <Field>
            <Textarea
              {...register('description')}
              placeholder="Brief overview of the event…"
              rows={4}
              data-invalid={errors.description ? true : undefined}
            />
            {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Context */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Context</Subheading>
          <Text>Help attendees understand the purpose and scope of your event.</Text>
        </div>
        <div className="space-y-6">
          <Field>
            <Label>Why</Label>
            <Textarea
              {...register('why')}
              placeholder="Why this event is happening…"
              rows={2}
              data-invalid={errors.why ? true : undefined}
            />
            {errors.why && <ErrorMessage>{errors.why.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>What</Label>
            <Textarea
              {...register('what')}
              placeholder="What the event is about…"
              rows={2}
              data-invalid={errors.what ? true : undefined}
            />
            {errors.what && <ErrorMessage>{errors.what.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Where (context)</Label>
            <Input
              {...register('where')}
              placeholder="Venue name, city, or platform…"
              data-invalid={errors.where ? true : undefined}
            />
            {errors.where && <ErrorMessage>{errors.where.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Who</Label>
            <Textarea
              {...register('who')}
              placeholder="Who should attend…"
              rows={2}
              data-invalid={errors.who ? true : undefined}
            />
            {errors.who && <ErrorMessage>{errors.who.message}</ErrorMessage>}
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
              : 'Create event'}
        </Button>
      </div>
    </form>
  )
}
