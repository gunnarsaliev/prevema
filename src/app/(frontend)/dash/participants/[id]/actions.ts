'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'

type UploadResult = { success: true } | { success: false; error: string }

export async function uploadParticipantImage(
  participantId: string,
  formData: FormData,
): Promise<UploadResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    const imageFile = formData.get('image') as File | null
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: 'No image file provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(imageFile.type)) {
      return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or SVG.' }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (imageFile.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' }
    }

    // Get participant name for alt text
    const participant = await payload.findByID({
      collection: 'participants',
      id: Number(participantId),
      depth: 0,
    })

    if (!participant) {
      return { success: false, error: 'Participant not found' }
    }

    // Upload to media collection
    const mediaResult = await payload.create({
      collection: 'media',
      data: { alt: `Profile photo for ${participant.name}` },
      file: {
        data: Buffer.from(await imageFile.arrayBuffer()),
        name: imageFile.name,
        mimetype: imageFile.type,
        size: imageFile.size,
      },
      overrideAccess: true,
    })

    if (!mediaResult) {
      return { success: false, error: 'Failed to upload image' }
    }

    // Update participant with new image
    await payload.update({
      collection: 'participants',
      id: Number(participantId),
      data: {
        imageUrl: mediaResult.id,
      },
      overrideAccess: false,
    })

    // Revalidate the participant detail page
    revalidatePath(`/dash/participants/${participantId}`)
    revalidatePath(`/dash/participants/${participantId}/edit`)

    return { success: true }
  } catch (err) {
    console.error('[uploadParticipantImage] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to upload image',
    }
  }
}
