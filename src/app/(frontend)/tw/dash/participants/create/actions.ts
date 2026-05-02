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
