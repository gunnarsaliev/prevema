'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'

type UpdateOrganizationResult =
  | { success: true; message: string }
  | { success: false; error: string }

type UpdateUserProfileResult =
  | { success: true; message: string }
  | { success: false; error: string }

function parsePayloadError(err: unknown): string {
  if (!(err instanceof Error)) return 'Failed to update organization'

  const msg = err.message

  // Payload validation errors are sometimes nested as JSON in the message
  try {
    const parsed = JSON.parse(msg) as { errors?: Array<{ message?: string }> }
    if (parsed.errors?.length) {
      return parsed.errors.map((e) => e.message ?? 'Unknown error').join(', ')
    }
  } catch {
    // not JSON — fall through
  }

  return msg
}

export async function updateOrganization(
  formData: FormData,
): Promise<UpdateOrganizationResult> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Find the organization owned by the current user
    const { docs } = await payload.find({
      collection: 'organizations',
      where: { owner: { equals: user.id } },
      limit: 1,
      depth: 0,
    })

    const org = docs[0]

    if (!org) {
      return { success: false, error: 'Organization not found' }
    }

    // Build organization update data
    const organizationData: Record<string, unknown> = {}

    const orgName = formData.get('orgName') as string | null
    if (orgName) organizationData.name = orgName

    // Email configuration
    const orgSenderName = formData.get('orgSenderName') as string | null
    const orgFromEmail = formData.get('orgFromEmail') as string | null
    const orgReplyToEmail = formData.get('orgReplyToEmail') as string | null
    const orgResendApiKey = formData.get('orgResendApiKey') as string | null

    if (orgSenderName || orgFromEmail || orgReplyToEmail || orgResendApiKey) {
      organizationData.emailConfig = {
        ...(orgSenderName && { senderName: orgSenderName }),
        ...(orgFromEmail && { fromEmail: orgFromEmail }),
        ...(orgReplyToEmail && { replyToEmail: orgReplyToEmail }),
        ...(orgResendApiKey && { resendApiKey: orgResendApiKey }),
      }
    }

    // Update the organization
    const updated = await payload.update({
      collection: 'organizations',
      id: org.id,
      data: organizationData as any,
    })

    if (!updated) {
      throw new Error('Failed to update organization')
    }

    return { success: true, message: 'Organization updated successfully' }
  } catch (err) {
    return { success: false, error: parsePayloadError(err) }
  }
}

export async function updateUserProfile(
  formData: FormData,
): Promise<UpdateUserProfileResult> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Build user update data
    const userData: Record<string, unknown> = {}

    const name = formData.get('name') as string | null
    if (name) userData.name = name

    // Handle avatar upload
    const avatarFile = formData.get('avatar') as File | null
    if (avatarFile && avatarFile.size > 0) {
      const imageResult = await payload.create({
        collection: 'media',
        data: { alt: `Profile photo for ${name || user.name}` },
        file: {
          data: Buffer.from(await avatarFile.arrayBuffer()),
          name: avatarFile.name,
          mimetype: avatarFile.type,
          size: avatarFile.size,
        },
        overrideAccess: true,
      })

      if (imageResult) {
        userData.avatar = imageResult.id
      }
    }

    // Update the user
    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: userData as any,
    })

    if (!updated) {
      throw new Error('Failed to update profile')
    }

    return { success: true, message: 'Profile updated successfully' }
  } catch (err) {
    return { success: false, error: parsePayloadError(err) }
  }
}
