'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { participantSchema, type ParticipantFormValues } from '@/lib/schemas/participant'
import { orgParticipantsTag } from '@/lib/cached-queries'

export type ParticipantActionState = {
  success: false
  message?: string
  errors?: Partial<Record<keyof ParticipantFormValues, string[]>>
}

export async function createParticipant(
  data: ParticipantFormValues,
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

    await payload.create({
      collection: 'participants',
      data: validated.data as any,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/participants')
    revalidateTag(orgParticipantsTag(validated.data.event))

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

    await payload.update({
      collection: 'participants',
      id: participantId,
      data: validated.data as any,
      user,
      overrideAccess: false,
    })

    revalidatePath('/tw/dash/participants')
    revalidatePath(`/tw/dash/participants/${participantId}`)
    revalidateTag(orgParticipantsTag(validated.data.event))

    redirect(`/tw/dash/participants/${participantId}`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to update participant.'
    return { success: false, message }
  }
}
