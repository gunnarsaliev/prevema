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

    revalidatePath('/dash/participants')
    revalidateTag(orgParticipantsTag(validated.data.event))

    redirect('/dash/participants')
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to create participant.'
    return { success: false, message }
  }
}

type QuickCreateParticipantRoleData = {
  name: string
  requiredFields?: string[]
  showOptionalFields?: boolean
  optionalFields?: string[]
}

export async function quickCreateParticipantRole(
  data: QuickCreateParticipantRoleData,
): Promise<
  { success: true; item: { id: number; name: string } } | { success: false; message: string }
> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) return { success: false, message: 'Unauthorized. Please log in.' }

    const doc = await payload.create({
      collection: 'participant-roles',
      data: data as any,
      user,
      overrideAccess: false,
    })

    return { success: true, item: { id: doc.id as number, name: doc.name } }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create role.',
    }
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

    revalidatePath('/dash/participants')
    revalidatePath(`/dash/participants/${participantId}`)
    revalidateTag(orgParticipantsTag(validated.data.event))

    redirect(`/dash/participants/${participantId}`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Failed to update participant.'
    return { success: false, message }
  }
}
