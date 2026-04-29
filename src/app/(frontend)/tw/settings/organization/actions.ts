'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { orgSettingsSchema, type OrgSettingsFormValues } from '@/lib/schemas/organization-settings'

export type OrgSettingsActionState =
  | { success: true; message: string }
  | {
      success: false
      message?: string
      errors?: Partial<Record<keyof OrgSettingsFormValues, string[]>>
    }

export async function updateOrgSettings(
  data: OrgSettingsFormValues,
): Promise<OrgSettingsActionState> {
  try {
    const validated = orgSettingsSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof OrgSettingsFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, message: 'Unauthorized. Please log in.' }
    }

    const { docs } = await payload.find({
      collection: 'organizations',
      where: { owner: { equals: user.id } },
      limit: 1,
      depth: 0,
    })

    const org = docs[0]

    if (!org) {
      return { success: false, message: 'Organization not found' }
    }

    const { name, senderName, fromEmail, replyToEmail, resendApiKey } = validated.data

    await payload.update({
      collection: 'organizations',
      id: org.id,
      data: {
        name,
        emailConfig: {
          ...(org.emailConfig ?? {}),
          ...(senderName !== undefined && { senderName }),
          ...(fromEmail !== undefined && { fromEmail }),
          ...(replyToEmail !== undefined && { replyToEmail }),
          ...(resendApiKey !== undefined && { resendApiKey }),
        },
      } as any,
    })

    revalidatePath('/tw/dash/settings/organization')

    return { success: true, message: 'Organization updated successfully' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update organization'
    return { success: false, message }
  }
}
