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

export async function createEvent(data: EventFormValues): Promise<CreateEventState> {
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

    await payload.create({
      collection: 'events',
      data: validated.data as any,
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
