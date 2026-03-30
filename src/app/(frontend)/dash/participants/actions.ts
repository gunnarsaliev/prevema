'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { participantSchema, type ParticipantFormValues } from '@/lib/schemas/participant'

// Helper to check if an error is a Next.js redirect
function isRedirectError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'digest' in error &&
    typeof error.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  )
}

export type ParticipantActionState = {
  success?: boolean
  message?: string
  errors?: {
    [K in keyof ParticipantFormValues]?: string[]
  }
}

/**
 * Server Action to create a new participant using PayloadCMS Local API
 * Follows Next.js best practices:
 * - Direct server-side execution (no API route overhead)
 * - Zod validation
 * - Proper error handling
 * - Cache revalidation
 * - Access control enforcement
 */
export async function createParticipant(
  prevState: ParticipantActionState | undefined,
  formData: FormData,
): Promise<ParticipantActionState> {
  try {
    // Extract and transform form data
    const rawFormData = {
      name: formData.get('name'),
      email: formData.get('email'),
      event: formData.get('event') ? Number(formData.get('event')) : undefined,
      participantRole: formData.get('participantRole')
        ? Number(formData.get('participantRole'))
        : undefined,
      status: formData.get('status') || 'not-approved',
      biography: formData.get('biography') || null,
      country: formData.get('country') || null,
      phoneNumber: formData.get('phoneNumber') || null,
      companyName: formData.get('companyName') || null,
      companyPosition: formData.get('companyPosition') || null,
      companyWebsite: formData.get('companyWebsite') || null,
      internalNotes: formData.get('internalNotes') || null,
      presentationTopic: formData.get('presentationTopic') || null,
      presentationSummary: formData.get('presentationSummary') || null,
      technicalRequirements: formData.get('technicalRequirements') || null,
    }

    // Get authenticated user from headers
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to create a participant.',
      }
    }

    // Handle profile image upload if provided
    const profileImageFile = formData.get('profileImage') as File | null
    let imageUrlId: number | undefined

    if (profileImageFile && profileImageFile.size > 0) {
      try {
        const imageResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Profile image for ${rawFormData.name}`,
          },
          file: {
            data: Buffer.from(await profileImageFile.arrayBuffer()),
            name: profileImageFile.name,
            mimetype: profileImageFile.type,
            size: profileImageFile.size,
          },
          user,
          overrideAccess: false,
        })

        imageUrlId = typeof imageResult.id === 'number' ? imageResult.id : Number(imageResult.id)
      } catch (imageError) {
        console.error('[createParticipant] Error uploading profile image:', imageError)
        return {
          success: false,
          message: 'Failed to upload profile image. Please try again.',
        }
      }
    }

    // Handle company logo upload if provided
    const companyLogoFile = formData.get('companyLogo') as File | null
    let companyLogoUrlId: number | undefined

    if (companyLogoFile && companyLogoFile.size > 0) {
      try {
        const logoResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Company logo for ${rawFormData.companyName || rawFormData.name}`,
          },
          file: {
            data: Buffer.from(await companyLogoFile.arrayBuffer()),
            name: companyLogoFile.name,
            mimetype: companyLogoFile.type,
            size: companyLogoFile.size,
          },
          user,
          overrideAccess: false,
        })

        companyLogoUrlId = typeof logoResult.id === 'number' ? logoResult.id : Number(logoResult.id)
      } catch (logoError) {
        console.error('[createParticipant] Error uploading company logo:', logoError)
        return {
          success: false,
          message: 'Failed to upload company logo. Please try again.',
        }
      }
    }

    // Add image IDs to form data
    const formDataWithImages = {
      ...rawFormData,
      imageUrl: imageUrlId,
      companyLogoUrl: companyLogoUrlId,
    }

    // Validate form data using Zod schema
    const validatedFields = participantSchema.safeParse(formDataWithImages)

    // Return early with field-specific errors if validation fails
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create participant using PayloadCMS Local API
    await payload.create({
      collection: 'participants',
      data: validatedFields.data,
      user,
      overrideAccess: false,
    })

    // Revalidate the participants list page to show the new participant
    revalidatePath('/dash/participants')

    // Redirect to participants list on success
    redirect('/dash/participants')
  } catch (error) {
    // Re-throw redirect errors (this is expected behavior in Next.js)
    if (isRedirectError(error)) {
      throw error
    }

    console.error('[createParticipant] Error creating participant:', error)

    // Handle Payload validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create participant. Please try again.',
    }
  }
}

/**
 * Server Action to update an existing participant using PayloadCMS Local API
 */
export async function updateParticipant(
  participantId: string,
  prevState: ParticipantActionState | undefined,
  formData: FormData,
): Promise<ParticipantActionState> {
  try {
    // Extract and transform form data
    const rawFormData = {
      name: formData.get('name'),
      email: formData.get('email'),
      event: formData.get('event') ? Number(formData.get('event')) : undefined,
      participantRole: formData.get('participantRole')
        ? Number(formData.get('participantRole'))
        : undefined,
      status: formData.get('status') || 'not-approved',
      biography: formData.get('biography') || null,
      country: formData.get('country') || null,
      phoneNumber: formData.get('phoneNumber') || null,
      companyName: formData.get('companyName') || null,
      companyPosition: formData.get('companyPosition') || null,
      companyWebsite: formData.get('companyWebsite') || null,
      internalNotes: formData.get('internalNotes') || null,
      presentationTopic: formData.get('presentationTopic') || null,
      presentationSummary: formData.get('presentationSummary') || null,
      technicalRequirements: formData.get('technicalRequirements') || null,
    }

    // Get authenticated user from headers
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to update the participant.',
      }
    }

    // Handle profile image upload if provided
    const profileImageFile = formData.get('profileImage') as File | null
    let imageUrlId: number | undefined

    if (profileImageFile && profileImageFile.size > 0) {
      try {
        const imageResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Profile image for ${rawFormData.name}`,
          },
          file: {
            data: Buffer.from(await profileImageFile.arrayBuffer()),
            name: profileImageFile.name,
            mimetype: profileImageFile.type,
            size: profileImageFile.size,
          },
          user,
          overrideAccess: false,
        })

        imageUrlId = typeof imageResult.id === 'number' ? imageResult.id : Number(imageResult.id)
      } catch (imageError) {
        console.error('[updateParticipant] Error uploading profile image:', imageError)
        return {
          success: false,
          message: 'Failed to upload profile image. Please try again.',
        }
      }
    }

    // Handle company logo upload if provided
    const companyLogoFile = formData.get('companyLogo') as File | null
    let companyLogoUrlId: number | undefined

    if (companyLogoFile && companyLogoFile.size > 0) {
      try {
        const logoResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Company logo for ${rawFormData.companyName || rawFormData.name}`,
          },
          file: {
            data: Buffer.from(await companyLogoFile.arrayBuffer()),
            name: companyLogoFile.name,
            mimetype: companyLogoFile.type,
            size: companyLogoFile.size,
          },
          user,
          overrideAccess: false,
        })

        companyLogoUrlId = typeof logoResult.id === 'number' ? logoResult.id : Number(logoResult.id)
      } catch (logoError) {
        console.error('[updateParticipant] Error uploading company logo:', logoError)
        return {
          success: false,
          message: 'Failed to upload company logo. Please try again.',
        }
      }
    }

    // Add image IDs to form data
    const formDataWithImages = {
      ...rawFormData,
      imageUrl: imageUrlId,
      companyLogoUrl: companyLogoUrlId,
    }

    // Validate form data using Zod schema
    const validatedFields = participantSchema.safeParse(formDataWithImages)

    // Return early with field-specific errors if validation fails
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Update participant using PayloadCMS Local API
    await payload.update({
      collection: 'participants',
      id: participantId,
      data: validatedFields.data,
      user,
      overrideAccess: false,
    })

    // Revalidate both the participants list and the specific participant page
    revalidatePath('/dash/participants')
    revalidatePath(`/dash/participants/${participantId}`)

    // Redirect to participants list on success
    redirect('/dash/participants')
  } catch (error) {
    // Re-throw redirect errors (this is expected behavior in Next.js)
    if (isRedirectError(error)) {
      throw error
    }

    console.error('[updateParticipant] Error updating participant:', error)

    // Handle Payload validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to update participant. Please try again.',
    }
  }
}
