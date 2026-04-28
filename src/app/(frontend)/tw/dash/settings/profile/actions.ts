'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas/profile'

export type ProfileActionState =
  | { success: true; message: string }
  | {
      success: false
      message?: string
      errors?: Partial<Record<keyof ProfileFormValues, string[]>>
    }

export async function updateProfile(data: ProfileFormValues): Promise<ProfileActionState> {
  try {
    const validated = profileSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors as Partial<
          Record<keyof ProfileFormValues, string[]>
        >,
      }
    }

    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, message: 'Unauthorized. Please log in.' }
    }

    const { name, newEmail, currentPassword, newPassword } = validated.data
    const isChangingEmail = !!newEmail?.trim() && newEmail !== user.email
    const isChangingPassword = !!newPassword?.trim()

    if (isChangingEmail || isChangingPassword) {
      try {
        const loginResult = await payload.login({
          collection: 'users',
          data: { email: user.email, password: currentPassword! },
        })
        if (!loginResult.user) {
          return {
            success: false,
            errors: { currentPassword: ['Current password is incorrect'] },
          }
        }
      } catch {
        return {
          success: false,
          errors: { currentPassword: ['Current password is incorrect'] },
        }
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (isChangingEmail) updateData.email = newEmail
    if (isChangingPassword) updateData.password = newPassword

    await payload.update({
      collection: 'users',
      id: user.id,
      data: updateData as any,
    })

    revalidatePath('/tw/dash/settings/profile')

    return { success: true, message: 'Profile updated successfully' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    return { success: false, message }
  }
}

export type AvatarActionState =
  | { success: true; message: string }
  | { success: false; message: string }

export async function uploadProfileImage(formData: FormData): Promise<AvatarActionState> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, message: 'Unauthorized. Please log in.' }
    }

    const avatarFile = formData.get('avatar') as File | null

    if (!avatarFile || avatarFile.size === 0) {
      return { success: false, message: 'No file provided' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(avatarFile.type)) {
      return { success: false, message: 'Only JPG, PNG, and WebP images are accepted' }
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      return { success: false, message: 'File must be smaller than 2 MB' }
    }

    const imageResult = await payload.create({
      collection: 'media',
      data: { alt: `Profile photo for ${user.name ?? user.email}` },
      file: {
        data: Buffer.from(await avatarFile.arrayBuffer()),
        name: avatarFile.name,
        mimetype: avatarFile.type,
        size: avatarFile.size,
      },
      user,
      overrideAccess: false,
    })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { profileImage: imageResult.id } as any,
    })

    revalidatePath('/tw/dash/settings/profile')

    return { success: true, message: 'Profile photo updated' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload profile photo'
    return { success: false, message }
  }
}
