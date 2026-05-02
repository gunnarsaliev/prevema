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
