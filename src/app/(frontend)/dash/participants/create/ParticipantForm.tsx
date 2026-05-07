'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition, useState } from 'react'
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
import { CreateParticipantRoleDrawer } from './CreateParticipantRoleDrawer'

type RoleOption = { id: number; name: string }
type EventOption = { id: number; name: string }

type ParticipantFormProps =
  | {
      mode: 'create'
      eventId?: number
      eventName?: string
      events?: EventOption[]
      participantRoles: RoleOption[]
    }
  | {
      mode: 'edit'
      participantId: string
      eventId: number
      eventName: string
      participantRoles: RoleOption[]
      defaultValues: ParticipantFormValues
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
  const [roles, setRoles] = useState<RoleOption[]>(props.participantRoles)
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false)

  const defaultValues: ParticipantFormValues =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          name: '',
          email: '',
          event: props.eventId ?? (undefined as any),
          participantRole: roles.length === 1 ? roles[0].id : (undefined as any),
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
    setValue,
    formState: { errors },
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues,
  })

  const onSubmit = (data: ParticipantFormValues) => {
    setServerMessage(null)
    const sanitized = sanitize(data)

    startTransition(async () => {
      if (props.mode === 'create') {
        const result = await createParticipant(sanitized)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof ParticipantFormValues, {
                type: 'server',
                message: messages?.[0],
              })
            })
          }
          setServerMessage(result.message ?? 'Something went wrong. Please try again.')
        }
      } else {
        const result = await updateParticipant(props.participantId, sanitized)
        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof ParticipantFormValues, {
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

  const cancelHref =
    props.mode === 'edit' ? `/dash/participants/${props.participantId}` : '/dash/participants'

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
        <Heading>{props.mode === 'edit' ? 'Edit Participant' : 'New Participant'}</Heading>
        <Divider className="my-10 mt-6" />

        {serverMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {serverMessage}
          </div>
        )}

        {/* Event */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Event</Subheading>
            <Text>The event this participant is associated with.</Text>
          </div>
          <div>
            {props.mode === 'create' && !props.eventId ? (
              <Field>
                <Label>Event *</Label>
                <Controller
                  name="event"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                      data-invalid={errors.event ? true : undefined}
                    >
                      <option value="">Select event</option>
                      {(props.events ?? []).map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.event && <ErrorMessage>{errors.event.message}</ErrorMessage>}
              </Field>
            ) : (
              <>
                <input type="hidden" {...register('event', { valueAsNumber: true })} />
                <p className="py-2 text-sm/6 text-zinc-950 dark:text-white">{props.eventName}</p>
              </>
            )}
          </div>
        </section>

        <Divider className="my-10" soft />

        {/* Basics */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Basics</Subheading>
            <Text>Core identity and role information.</Text>
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
              <div className="flex items-baseline justify-between">
                <Label>Role *</Label>
                <button
                  type="button"
                  onClick={() => setRoleDrawerOpen(true)}
                  className="text-xs font-normal text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add new
                </button>
              </div>
              <Controller
                name="participantRole"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    data-invalid={errors.participantRole ? true : undefined}
                  >
                    <option value="">Select role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.participantRole && (
                <ErrorMessage>{errors.participantRole.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Status</Label>
              <Select {...register('status')} data-invalid={errors.status ? true : undefined}>
                <option value="not-approved">Not approved</option>
                <option value="approved">Approved</option>
                <option value="need-info">Need info</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
            </Field>
          </div>
        </section>

        <Divider className="my-10" soft />

        {/* Contact */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Contact</Subheading>
            <Text>Optional contact details for this participant.</Text>
          </div>
          <div className="space-y-6">
            <Field>
              <Label>Phone number</Label>
              <Input
                {...register('phoneNumber')}
                placeholder="+1 555 000 0000"
                data-invalid={errors.phoneNumber ? true : undefined}
              />
              {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber.message}</ErrorMessage>}
            </Field>

            <Field>
              <Label>Country</Label>
              <Input
                {...register('country')}
                placeholder="United States"
                data-invalid={errors.country ? true : undefined}
              />
              {errors.country && <ErrorMessage>{errors.country.message}</ErrorMessage>}
            </Field>
          </div>
        </section>

        <Divider className="my-10" soft />

        {/* Company */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Company</Subheading>
            <Text>Affiliation details for this participant.</Text>
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
                placeholder="CTO"
                data-invalid={errors.companyPosition ? true : undefined}
              />
              {errors.companyPosition && (
                <ErrorMessage>{errors.companyPosition.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Website</Label>
              <Input
                {...register('companyWebsite')}
                placeholder="https://example.com"
                data-invalid={errors.companyWebsite ? true : undefined}
              />
              {errors.companyWebsite && (
                <ErrorMessage>{errors.companyWebsite.message}</ErrorMessage>
              )}
            </Field>
          </div>
        </section>

        <Divider className="my-10" soft />

        {/* Biography */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Biography</Subheading>
            <Text>Short bio shown on public profiles.</Text>
          </div>
          <div>
            <Field>
              <Textarea
                {...register('biography')}
                placeholder="Brief bio…"
                rows={4}
                data-invalid={errors.biography ? true : undefined}
              />
              {errors.biography && <ErrorMessage>{errors.biography.message}</ErrorMessage>}
            </Field>
          </div>
        </section>

        <Divider className="my-10" soft />

        {/* Presentation */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Presentation</Subheading>
            <Text>Talk or session details, if applicable.</Text>
          </div>
          <div className="space-y-6">
            <Field>
              <Label>Topic</Label>
              <Input
                {...register('presentationTopic')}
                placeholder="Topic title"
                data-invalid={errors.presentationTopic ? true : undefined}
              />
              {errors.presentationTopic && (
                <ErrorMessage>{errors.presentationTopic.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Summary</Label>
              <Textarea
                {...register('presentationSummary')}
                placeholder="Brief description of the presentation…"
                rows={3}
                data-invalid={errors.presentationSummary ? true : undefined}
              />
              {errors.presentationSummary && (
                <ErrorMessage>{errors.presentationSummary.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Technical requirements</Label>
              <Textarea
                {...register('technicalRequirements')}
                placeholder="Microphone, projector…"
                rows={2}
                data-invalid={errors.technicalRequirements ? true : undefined}
              />
              {errors.technicalRequirements && (
                <ErrorMessage>{errors.technicalRequirements.message}</ErrorMessage>
              )}
            </Field>
          </div>
        </section>

        <Divider className="my-10" soft />

        {/* Internal notes */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Internal notes</Subheading>
            <Text>Private notes visible only to your team.</Text>
          </div>
          <div>
            <Field>
              <Textarea
                {...register('internalNotes')}
                placeholder="Any internal notes…"
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
      <CreateParticipantRoleDrawer
        open={roleDrawerOpen}
        onOpenChange={setRoleDrawerOpen}
        onCreated={(item) => {
          setRoles((prev) => [...prev, item])
          setValue('participantRole', item.id)
        }}
      />
    </>
  )
}
