'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { eventSchema, type EventFormValues } from '@/lib/schemas/event'
import { orgEventsTag, orgLayoutTag, orgCountsTag } from '@/lib/cached-queries'

export type CreateEventState = {
  success: false
  message?: string
  errors?: Partial<Record<keyof EventFormValues, string[]>>
}

export type UploadImageState =
  | { success: true; imageId: number }
  | { success: false; message: string }

export async function uploadEventImage(formData: FormData): Promise<UploadImageState> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const file = formData.get('image') as File | null
    if (!file || file.size === 0) return { success: false, message: 'No file provided.' }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowed.includes(file.type)) {
      return { success: false, message: 'Only JPG, PNG, or WebP images are accepted.' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: 'Image must be smaller than 5 MB.' }
    }

    const result = await payload.create({
      collection: 'media',
      data: { alt: file.name },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
      user,
      overrideAccess: false,
    })

    const imageId = typeof result.id === 'number' ? result.id : Number(result.id)
    return { success: true, imageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image.'
    return { success: false, message }
  }
}

export async function createEvent(
  data: EventFormValues,
  imageId?: number,
): Promise<CreateEventState> {
  try {
    const validated = eventSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof EventFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, message: 'Unauthorized. Please log in.' }
    }

    const eventData: any = { ...validated.data }
    if (imageId) eventData.image = imageId

    await payload.create({
      collection: 'events',
      data: eventData,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/events')

    const orgId = validated.data.organization
    if (orgId) {
      revalidateTag(orgEventsTag(orgId))
      revalidateTag(orgLayoutTag(orgId))
      revalidateTag(orgCountsTag(orgId))
    }

    redirect('/tw/dash/events')
  } catch (error) {
    if (isRedirectError(error)) throw error

    const message =
      error instanceof Error ? error.message : 'Failed to create event. Please try again.'
    return { success: false, message }
  }
}

export async function updateEvent(
  eventId: string,
  data: EventFormValues,
  imageId?: number | null,
): Promise<CreateEventState> {
  try {
    const validated = eventSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof EventFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, message: 'Unauthorized. Please log in.' }
    }

    const updateData: any = { ...validated.data }
    if (imageId !== undefined) {
      updateData.image = imageId
    }

    await payload.update({
      collection: 'events',
      id: eventId,
      data: updateData,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/events')
    revalidatePath(`/tw/dash/events/${eventId}`)

    const orgId = validated.data.organization
    if (orgId) {
      revalidateTag(orgEventsTag(orgId))
      revalidateTag(orgLayoutTag(orgId))
      revalidateTag(orgCountsTag(orgId))
    }

    redirect(`/tw/dash/events/${eventId}`)
  } catch (error) {
    if (isRedirectError(error)) throw error

    const message =
      error instanceof Error ? error.message : 'Failed to update event. Please try again.'
    return { success: false, message }
  }
}

export async function deleteEvent(
  eventId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const existing = await payload.findByID({
      collection: 'events',
      id: eventId,
      depth: 0,
      overrideAccess: false,
      user,
    })

    await payload.delete({
      collection: 'events',
      id: eventId,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/events')
    revalidatePath(`/tw/dash/events/${eventId}`)

    const orgId =
      existing.organization &&
      (typeof existing.organization === 'object'
        ? (existing.organization as { id: number }).id
        : existing.organization)

    if (orgId) {
      revalidateTag(orgEventsTag(orgId))
      revalidateTag(orgLayoutTag(orgId))
      revalidateTag(orgCountsTag(orgId))
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete event.'
    return { success: false, message }
  }
}
