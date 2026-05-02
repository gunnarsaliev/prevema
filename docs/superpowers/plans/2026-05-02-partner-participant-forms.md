# Partner & Participant Create/Edit Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add frontend create/edit forms for partners and participants, mirroring the events form pattern, with the event pre-filled from a URL param and type/role loaded from the user's org.

**Architecture:** Each collection gets a `create/` directory (form component + server actions + skeleton + loading) and an `[id]/edit/` directory (server page + loading), following the exact structure of `src/app/(frontend)/tw/dash/events/`. The existing `uploadEventImage` server action is reused for media uploads. Detail pages (`[id]/page.tsx`) are updated to swap the Payload admin edit button for the new frontend edit route.

**Tech Stack:** Next.js 15 App Router (server + client components), Payload CMS (`payload.create`/`payload.update`/`payload.delete`), React Hook Form + Zod (`@hookform/resolvers/zod`), Catalyst UI components (`@/components/catalyst/*`), `next/cache` (`revalidatePath`, `revalidateTag`).

---

## File Map

**New files — Partners:**
- `src/app/(frontend)/tw/dash/partners/create/actions.ts` — server actions: `createPartner`, `updatePartner`, `deletePartner`
- `src/app/(frontend)/tw/dash/partners/create/PartnerForm.tsx` — client form component
- `src/app/(frontend)/tw/dash/partners/create/PartnerFormSkeleton.tsx` — loading skeleton
- `src/app/(frontend)/tw/dash/partners/create/loading.tsx` — Suspense loading page
- `src/app/(frontend)/tw/dash/partners/create/page.tsx` — server page for create
- `src/app/(frontend)/tw/dash/partners/[id]/edit/page.tsx` — server page for edit
- `src/app/(frontend)/tw/dash/partners/[id]/edit/loading.tsx` — edit loading page

**New files — Participants:**
- `src/app/(frontend)/tw/dash/participants/create/actions.ts`
- `src/app/(frontend)/tw/dash/participants/create/ParticipantForm.tsx`
- `src/app/(frontend)/tw/dash/participants/create/ParticipantFormSkeleton.tsx`
- `src/app/(frontend)/tw/dash/participants/create/loading.tsx`
- `src/app/(frontend)/tw/dash/participants/create/page.tsx`
- `src/app/(frontend)/tw/dash/participants/[id]/edit/page.tsx`
- `src/app/(frontend)/tw/dash/participants/[id]/edit/loading.tsx`

**Modified files:**
- `src/app/(frontend)/tw/dash/partners/[id]/page.tsx` — swap Edit button href to frontend route
- `src/app/(frontend)/tw/dash/participants/[id]/page.tsx` — swap Edit button href to frontend route

---

## Task 1: Partner server actions

**Files:**
- Create: `src/app/(frontend)/tw/dash/partners/create/actions.ts`

- [ ] **Step 1: Create the actions file**

```ts
'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { partnerSchema, type PartnerFormValues } from '@/lib/schemas/partner'
import { orgPartnersTag, orgCountsTag } from '@/lib/cached-queries'

export type PartnerActionState = {
  success: false
  message?: string
  errors?: Partial<Record<keyof PartnerFormValues, string[]>>
}

export async function createPartner(
  data: PartnerFormValues,
  imageId?: number,
): Promise<PartnerActionState> {
  try {
    const validated = partnerSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof PartnerFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const createData: any = { ...validated.data }
    if (imageId) createData.companyLogo = imageId

    await payload.create({
      collection: 'partners',
      data: createData,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/partners')
    revalidateTag(orgPartnersTag(validated.data.event))
    revalidateTag(orgCountsTag(validated.data.event))

    redirect('/tw/dash/partners')
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to create partner.'
    return { success: false, message }
  }
}

export async function updatePartner(
  partnerId: string,
  data: PartnerFormValues,
  imageId?: number | null,
): Promise<PartnerActionState> {
  try {
    const validated = partnerSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof PartnerFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const updateData: any = { ...validated.data }
    if (imageId !== undefined) updateData.companyLogo = imageId

    await payload.update({
      collection: 'partners',
      id: partnerId,
      data: updateData,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/partners')
    revalidatePath(`/tw/dash/partners/${partnerId}`)
    revalidateTag(orgPartnersTag(validated.data.event))
    revalidateTag(orgCountsTag(validated.data.event))

    redirect(`/tw/dash/partners/${partnerId}`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to update partner.'
    return { success: false, message }
  }
}

export async function deletePartner(
  partnerId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const existing = await payload.findByID({
      collection: 'partners',
      id: partnerId,
      depth: 0,
      overrideAccess: false,
      user,
    })

    const eventId =
      existing.event && typeof existing.event === 'object'
        ? (existing.event as { id: number }).id
        : (existing.event as number)

    await payload.delete({
      collection: 'partners',
      id: partnerId,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/partners')
    revalidatePath(`/tw/dash/partners/${partnerId}`)
    if (eventId) {
      revalidateTag(orgPartnersTag(eventId))
      revalidateTag(orgCountsTag(eventId))
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete partner.'
    return { success: false, message }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /path/to/project && npx tsc --noEmit 2>&1 | grep "partners/create/actions"
```

Expected: no output (no errors in this file).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/partners/create/actions.ts
git commit -m "feat: partner server actions (create, update, delete)"
```

---

## Task 2: Participant server actions

**Files:**
- Create: `src/app/(frontend)/tw/dash/participants/create/actions.ts`

- [ ] **Step 1: Create the actions file**

```ts
'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { participantSchema, type ParticipantFormValues } from '@/lib/schemas/participant'
import { orgParticipantsTag, orgCountsTag } from '@/lib/cached-queries'

export type ParticipantActionState = {
  success: false
  message?: string
  errors?: Partial<Record<keyof ParticipantFormValues, string[]>>
}

export async function createParticipant(
  data: ParticipantFormValues,
  imageId?: number,
): Promise<ParticipantActionState> {
  try {
    const validated = participantSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof ParticipantFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const createData: any = { ...validated.data }
    if (imageId) createData.imageUrl = imageId

    await payload.create({
      collection: 'participants',
      data: createData,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/participants')
    revalidateTag(orgParticipantsTag(validated.data.event))
    revalidateTag(orgCountsTag(validated.data.event))

    redirect('/tw/dash/participants')
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to create participant.'
    return { success: false, message }
  }
}

export async function updateParticipant(
  participantId: string,
  data: ParticipantFormValues,
  imageId?: number | null,
): Promise<ParticipantActionState> {
  try {
    const validated = participantSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof ParticipantFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const updateData: any = { ...validated.data }
    if (imageId !== undefined) updateData.imageUrl = imageId

    await payload.update({
      collection: 'participants',
      id: participantId,
      data: updateData,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/participants')
    revalidatePath(`/tw/dash/participants/${participantId}`)
    revalidateTag(orgParticipantsTag(validated.data.event))
    revalidateTag(orgCountsTag(validated.data.event))

    redirect(`/tw/dash/participants/${participantId}`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to update participant.'
    return { success: false, message }
  }
}

export async function deleteParticipant(
  participantId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const existing = await payload.findByID({
      collection: 'participants',
      id: participantId,
      depth: 0,
      overrideAccess: false,
      user,
    })

    const eventId =
      existing.event && typeof existing.event === 'object'
        ? (existing.event as { id: number }).id
        : (existing.event as number)

    await payload.delete({
      collection: 'participants',
      id: participantId,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/participants')
    revalidatePath(`/tw/dash/participants/${participantId}`)
    if (eventId) {
      revalidateTag(orgParticipantsTag(eventId))
      revalidateTag(orgCountsTag(eventId))
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete participant.'
    return { success: false, message }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "participants/create/actions"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/participants/create/actions.ts
git commit -m "feat: participant server actions (create, update, delete)"
```

---

## Task 3: PartnerForm client component

**Files:**
- Create: `src/app/(frontend)/tw/dash/partners/create/PartnerForm.tsx`

**Context:** Imports `uploadEventImage` from the events actions (already handles media upload to the `media` collection). The form receives the event ID and name (for display), an array of partner-type options, and an array of tier options from the server page. In edit mode it also receives `defaultValues` and `existingLogoUrl`.

- [ ] **Step 1: Create PartnerForm.tsx**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "partners/create/PartnerForm"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/partners/create/PartnerForm.tsx
git commit -m "feat: PartnerForm client component"
```

---

## Task 4: PartnerFormSkeleton + loading pages

**Files:**
- Create: `src/app/(frontend)/tw/dash/partners/create/PartnerFormSkeleton.tsx`
- Create: `src/app/(frontend)/tw/dash/partners/create/loading.tsx`
- Create: `src/app/(frontend)/tw/dash/partners/[id]/edit/loading.tsx`

- [ ] **Step 1: Create PartnerFormSkeleton.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Button } from '@/components/catalyst/button'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm/6 font-medium text-zinc-950 dark:text-white">{children}</span>
}

export function PartnerFormSkeleton({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>{mode === 'edit' ? 'Edit Partner' : 'New Partner'}</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company Logo</Subheading>
          <Text>Upload a logo image. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company Details</Subheading>
          <Text>Core information about the partner company.</Text>
        </div>
        <div className="space-y-6">
          {['Company name *', 'Partner type *', 'Tier', 'Status', 'Field of expertise', 'Website'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Contact</Subheading>
          <Text>Primary contact person for this partnership.</Text>
        </div>
        <div className="space-y-6">
          {['Contact person *', 'Contact email *', 'General company email'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>About</Subheading>
          <Text>Additional details about the partnership.</Text>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <FieldLabel>Company description</FieldLabel>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Sponsorship level</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Additional notes</FieldLabel>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="button" plain disabled>Cancel</Button>
        <Button type="button" disabled>{mode === 'edit' ? 'Save changes' : 'Create partner'}</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create create/loading.tsx**

```tsx
import { PartnerFormSkeleton } from './PartnerFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <PartnerFormSkeleton mode="create" />
    </div>
  )
}
```

- [ ] **Step 3: Create [id]/edit/loading.tsx**

```tsx
import { PartnerFormSkeleton } from '../../create/PartnerFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <PartnerFormSkeleton mode="edit" />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/partners/create/PartnerFormSkeleton.tsx \
        src/app/\(frontend\)/tw/dash/partners/create/loading.tsx \
        src/app/\(frontend\)/tw/dash/partners/\[id\]/edit/loading.tsx
git commit -m "feat: PartnerFormSkeleton and loading pages"
```

---

## Task 5: Partner create page

**Files:**
- Create: `src/app/(frontend)/tw/dash/partners/create/page.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { PartnerForm } from './PartnerForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Partner',
}

export default async function CreatePartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams

  if (!eventId) notFound()

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  // Verify the event belongs to the user's org
  const event = await payload
    .findByID({
      collection: 'events',
      id: Number(eventId),
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!event) notFound()

  const orgId =
    typeof event.organization === 'object' && event.organization !== null
      ? (event.organization as { id: number }).id
      : (event.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const [{ docs: partnerTypes }, { docs: tiers }] = await Promise.all([
    payload.find({
      collection: 'partner-types',
      where: { organization: { in: organizationIds } },
      depth: 0,
      limit: 200,
      select: { name: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'partner-tiers',
      where: { organization: { in: organizationIds } },
      depth: 0,
      limit: 200,
      select: { name: true },
      overrideAccess: true,
    }),
  ])

  return (
    <div className="px-8 py-8">
      <PartnerForm
        mode="create"
        eventId={Number(eventId)}
        eventName={event.name}
        partnerTypes={partnerTypes.map((t) => ({ id: t.id, name: t.name }))}
        tiers={tiers.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "partners/create/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/partners/create/page.tsx
git commit -m "feat: partner create page"
```

---

## Task 6: Partner edit page

**Files:**
- Create: `src/app/(frontend)/tw/dash/partners/[id]/edit/page.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { PartnerForm } from '../../create/PartnerForm'
import type { PartnerFormValues } from '@/lib/schemas/partner'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const partner = await payload
    .findByID({ collection: 'partners', id: Number(id), depth: 0, overrideAccess: true })
    .catch(() => null)
  return { title: partner?.companyName ?? 'Edit Partner' }
}

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const partner = await payload
    .findByID({
      collection: 'partners',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1,
    })
    .catch(() => null)

  if (!partner) notFound()

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const orgId =
    typeof partner.organization === 'object' && partner.organization !== null
      ? (partner.organization as { id: number }).id
      : (partner.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const eventId =
    typeof partner.event === 'object' && partner.event !== null
      ? (partner.event as { id: number }).id
      : (partner.event as number)

  const eventName =
    typeof partner.event === 'object' && partner.event !== null && 'name' in partner.event
      ? (partner.event as { name: string }).name
      : String(eventId)

  const existingLogoUrl =
    partner.companyLogo &&
    typeof partner.companyLogo === 'object' &&
    'url' in partner.companyLogo
      ? (partner.companyLogo as { url?: string | null }).url ?? null
      : null

  const [{ docs: partnerTypes }, { docs: tiers }] = await Promise.all([
    payload.find({
      collection: 'partner-types',
      where: { organization: { in: organizationIds } },
      depth: 0,
      limit: 200,
      select: { name: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'partner-tiers',
      where: { organization: { in: organizationIds } },
      depth: 0,
      limit: 200,
      select: { name: true },
      overrideAccess: true,
    }),
  ])

  const defaultValues: PartnerFormValues = {
    companyName: partner.companyName,
    event: eventId,
    partnerType:
      typeof partner.partnerType === 'object' && partner.partnerType !== null
        ? (partner.partnerType as { id: number }).id
        : (partner.partnerType as number),
    contactPerson: partner.contactPerson,
    contactEmail: partner.contactEmail,
    email: partner.email ?? null,
    fieldOfExpertise: partner.fieldOfExpertise ?? null,
    companyWebsiteUrl: partner.companyWebsiteUrl ?? null,
    companyLogo:
      partner.companyLogo && typeof partner.companyLogo === 'object'
        ? (partner.companyLogo as { id: number }).id
        : (partner.companyLogo as number | null | undefined) ?? null,
    companyLogoUrl: partner.companyLogoUrl ?? null,
    companyBanner:
      partner.companyBanner && typeof partner.companyBanner === 'object'
        ? (partner.companyBanner as { id: number }).id
        : (partner.companyBanner as number | null | undefined) ?? null,
    companyDescription: partner.companyDescription ?? null,
    tier:
      partner.tier && typeof partner.tier === 'object'
        ? (partner.tier as { id: number }).id
        : (partner.tier as number | null | undefined) ?? null,
    sponsorshipLevel: partner.sponsorshipLevel ?? null,
    status: partner.status ?? 'default',
    additionalNotes: partner.additionalNotes ?? null,
  }

  return (
    <div className="px-8 py-8">
      <PartnerForm
        mode="edit"
        partnerId={id}
        eventId={eventId}
        eventName={eventName}
        partnerTypes={partnerTypes.map((t) => ({ id: t.id, name: t.name }))}
        tiers={tiers.map((t) => ({ id: t.id, name: t.name }))}
        defaultValues={defaultValues}
        existingLogoUrl={existingLogoUrl}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "partners/\[id\]/edit/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/partners/\[id\]/edit/page.tsx
git commit -m "feat: partner edit page"
```

---

## Task 7: Update partner detail page edit button

**Files:**
- Modify: `src/app/(frontend)/tw/dash/partners/[id]/page.tsx`

- [ ] **Step 1: Replace the Payload admin edit href**

Find this line (around line 138):
```tsx
<Button href={`/admin/collections/partners/${partner.id}`}>Edit</Button>
```

Replace with:
```tsx
<Button href={`/tw/dash/partners/${partner.id}/edit`}>Edit</Button>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "partners/\[id\]/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/partners/\[id\]/page.tsx
git commit -m "feat: partner detail edit button points to frontend edit route"
```

---

## Task 8: ParticipantForm client component

**Files:**
- Create: `src/app/(frontend)/tw/dash/participants/create/ParticipantForm.tsx`

- [ ] **Step 1: Create ParticipantForm.tsx**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "participants/create/ParticipantForm"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/participants/create/ParticipantForm.tsx
git commit -m "feat: ParticipantForm client component"
```

---

## Task 9: ParticipantFormSkeleton + loading pages

**Files:**
- Create: `src/app/(frontend)/tw/dash/participants/create/ParticipantFormSkeleton.tsx`
- Create: `src/app/(frontend)/tw/dash/participants/create/loading.tsx`
- Create: `src/app/(frontend)/tw/dash/participants/[id]/edit/loading.tsx`

- [ ] **Step 1: Create ParticipantFormSkeleton.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Button } from '@/components/catalyst/button'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm/6 font-medium text-zinc-950 dark:text-white">{children}</span>
}

export function ParticipantFormSkeleton({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>{mode === 'edit' ? 'Edit Participant' : 'New Participant'}</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile Photo</Subheading>
          <Text>Upload a headshot or profile photo. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Identity</Subheading>
          <Text>Basic details about the participant.</Text>
        </div>
        <div className="space-y-6">
          {['Name *', 'Email *', 'Role *', 'Status'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile</Subheading>
          <Text>Personal and contact details.</Text>
        </div>
        <div className="space-y-6">
          {['Country', 'Phone number'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
          <div className="space-y-1.5">
            <FieldLabel>Biography</FieldLabel>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company</Subheading>
          <Text>Professional affiliation.</Text>
        </div>
        <div className="space-y-6">
          {['Company name', 'Position / title', 'Company website'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="button" plain disabled>Cancel</Button>
        <Button type="button" disabled>{mode === 'edit' ? 'Save changes' : 'Create participant'}</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create create/loading.tsx**

```tsx
import { ParticipantFormSkeleton } from './ParticipantFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <ParticipantFormSkeleton mode="create" />
    </div>
  )
}
```

- [ ] **Step 3: Create [id]/edit/loading.tsx**

```tsx
import { ParticipantFormSkeleton } from '../../create/ParticipantFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <ParticipantFormSkeleton mode="edit" />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/participants/create/ParticipantFormSkeleton.tsx \
        src/app/\(frontend\)/tw/dash/participants/create/loading.tsx \
        src/app/\(frontend\)/tw/dash/participants/\[id\]/edit/loading.tsx
git commit -m "feat: ParticipantFormSkeleton and loading pages"
```

---

## Task 10: Participant create page

**Files:**
- Create: `src/app/(frontend)/tw/dash/participants/create/page.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { ParticipantForm } from './ParticipantForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Participant',
}

export default async function CreateParticipantPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams

  if (!eventId) notFound()

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const event = await payload
    .findByID({
      collection: 'events',
      id: Number(eventId),
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!event) notFound()

  const orgId =
    typeof event.organization === 'object' && event.organization !== null
      ? (event.organization as { id: number }).id
      : (event.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const { docs: participantRoles } = await payload.find({
    collection: 'participant-roles',
    where: { organization: { in: organizationIds } },
    depth: 0,
    limit: 200,
    select: { name: true },
    overrideAccess: true,
  })

  return (
    <div className="px-8 py-8">
      <ParticipantForm
        mode="create"
        eventId={Number(eventId)}
        eventName={event.name}
        participantRoles={participantRoles.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "participants/create/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/participants/create/page.tsx
git commit -m "feat: participant create page"
```

---

## Task 11: Participant edit page

**Files:**
- Create: `src/app/(frontend)/tw/dash/participants/[id]/edit/page.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { ParticipantForm } from '../../create/ParticipantForm'
import type { ParticipantFormValues } from '@/lib/schemas/participant'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const participant = await payload
    .findByID({ collection: 'participants', id: Number(id), depth: 0, overrideAccess: true })
    .catch(() => null)
  return { title: participant?.name ?? 'Edit Participant' }
}

export default async function EditParticipantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const participant = await payload
    .findByID({
      collection: 'participants',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1,
    })
    .catch(() => null)

  if (!participant) notFound()

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const orgId =
    typeof participant.organization === 'object' && participant.organization !== null
      ? (participant.organization as { id: number }).id
      : (participant.organization as number)

  if (!organizationIds.includes(Number(orgId))) notFound()

  const eventId =
    typeof participant.event === 'object' && participant.event !== null
      ? (participant.event as { id: number }).id
      : (participant.event as number)

  const eventName =
    typeof participant.event === 'object' && participant.event !== null && 'name' in participant.event
      ? (participant.event as { name: string }).name
      : String(eventId)

  const existingPhotoUrl =
    participant.imageUrl &&
    typeof participant.imageUrl === 'object' &&
    'url' in participant.imageUrl
      ? (participant.imageUrl as { url?: string | null }).url ?? null
      : null

  const { docs: participantRoles } = await payload.find({
    collection: 'participant-roles',
    where: { organization: { in: organizationIds } },
    depth: 0,
    limit: 200,
    select: { name: true },
    overrideAccess: true,
  })

  const defaultValues: ParticipantFormValues = {
    name: participant.name,
    email: participant.email,
    event: eventId,
    participantRole:
      typeof participant.participantRole === 'object' && participant.participantRole !== null
        ? (participant.participantRole as { id: number }).id
        : (participant.participantRole as number),
    status: participant.status ?? 'not-approved',
    imageUrl:
      participant.imageUrl && typeof participant.imageUrl === 'object'
        ? (participant.imageUrl as { id: number }).id
        : (participant.imageUrl as number | null | undefined) ?? null,
    biography: participant.biography ?? null,
    country: participant.country ?? null,
    phoneNumber: participant.phoneNumber ?? null,
    companyLogoUrl:
      participant.companyLogoUrl && typeof participant.companyLogoUrl === 'object'
        ? (participant.companyLogoUrl as { id: number }).id
        : (participant.companyLogoUrl as number | null | undefined) ?? null,
    companyName: participant.companyName ?? null,
    companyPosition: participant.companyPosition ?? null,
    companyWebsite: participant.companyWebsite ?? null,
    internalNotes: participant.internalNotes ?? null,
    presentationTopic: participant.presentationTopic ?? null,
    presentationSummary: participant.presentationSummary ?? null,
    technicalRequirements: participant.technicalRequirements ?? null,
  }

  return (
    <div className="px-8 py-8">
      <ParticipantForm
        mode="edit"
        participantId={id}
        eventId={eventId}
        eventName={eventName}
        participantRoles={participantRoles.map((r) => ({ id: r.id, name: r.name }))}
        defaultValues={defaultValues}
        existingPhotoUrl={existingPhotoUrl}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "participants/\[id\]/edit/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/participants/\[id\]/edit/page.tsx
git commit -m "feat: participant edit page"
```

---

## Task 12: Update participant detail page edit button

**Files:**
- Modify: `src/app/(frontend)/tw/dash/participants/[id]/page.tsx`

- [ ] **Step 1: Replace the Payload admin edit href**

Find this line (around line 156):
```tsx
<Button href={`/admin/collections/participants/${participant.id}`}>Edit</Button>
```

Replace with:
```tsx
<Button href={`/tw/dash/participants/${participant.id}/edit`}>Edit</Button>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "participants/\[id\]/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/participants/\[id\]/page.tsx
git commit -m "feat: participant detail edit button points to frontend edit route"
```

---

## Task 13: Final TypeScript check

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: no errors. If there are errors, fix them before proceeding.

- [ ] **Step 2: Run dev server and verify routes load**

```bash
# In one terminal:
npm run dev

# Then in browser, verify:
# - /tw/dash/partners/create?eventId=<valid-id>  → shows PartnerForm
# - /tw/dash/partners/<id>/edit                 → shows PartnerForm in edit mode
# - /tw/dash/partners/<id>                       → Edit button goes to frontend route
# - /tw/dash/participants/create?eventId=<id>   → shows ParticipantForm
# - /tw/dash/participants/<id>/edit             → shows ParticipantForm in edit mode
# - /tw/dash/participants/<id>                   → Edit button goes to frontend route
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git status  # verify only expected files
git commit -m "chore: partner and participant create/edit forms complete"
```
