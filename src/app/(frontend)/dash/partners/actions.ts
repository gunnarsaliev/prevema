'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { partnerSchema, type PartnerFormValues } from '@/lib/schemas/partner'

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

export type PartnerActionState = {
  success?: boolean
  message?: string
  errors?: {
    [K in keyof PartnerFormValues]?: string[]
  }
}

/**
 * Server Action to create a new partner using PayloadCMS Local API
 */
export async function createPartner(
  prevState: PartnerActionState | undefined,
  formData: FormData,
): Promise<PartnerActionState> {
  try {
    // Extract and transform form data
    const rawFormData = {
      companyName: formData.get('companyName'),
      event: formData.get('event') ? Number(formData.get('event')) : undefined,
      partnerType: formData.get('partnerType') ? Number(formData.get('partnerType')) : undefined,
      contactPerson: formData.get('contactPerson'),
      contactEmail: formData.get('contactEmail'),
      email: formData.get('email') || null,
      fieldOfExpertise: formData.get('fieldOfExpertise') || null,
      companyWebsiteUrl: formData.get('companyWebsiteUrl') || null,
      companyLogoUrl: formData.get('companyLogoUrl') || null,
      companyDescription: formData.get('companyDescription') || null,
      tier: formData.get('tier') ? Number(formData.get('tier')) : null,
      sponsorshipLevel: formData.get('sponsorshipLevel') || null,
      status: formData.get('status') || 'default',
      additionalNotes: formData.get('additionalNotes') || null,
    }

    // Get authenticated user from headers
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to create a partner.',
      }
    }

    // Handle company logo upload if provided
    const companyLogoFile = formData.get('companyLogo') as File | null
    let companyLogoId: number | undefined

    if (companyLogoFile && companyLogoFile.size > 0) {
      try {
        const logoResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Company logo for ${rawFormData.companyName}`,
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

        companyLogoId = typeof logoResult.id === 'number' ? logoResult.id : Number(logoResult.id)
      } catch (logoError) {
        console.error('[createPartner] Error uploading company logo:', logoError)
        return {
          success: false,
          message: 'Failed to upload company logo. Please try again.',
        }
      }
    }

    // Handle company banner upload if provided
    const companyBannerFile = formData.get('companyBanner') as File | null
    let companyBannerId: number | undefined

    if (companyBannerFile && companyBannerFile.size > 0) {
      try {
        const bannerResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Company banner for ${rawFormData.companyName}`,
          },
          file: {
            data: Buffer.from(await companyBannerFile.arrayBuffer()),
            name: companyBannerFile.name,
            mimetype: companyBannerFile.type,
            size: companyBannerFile.size,
          },
          user,
          overrideAccess: false,
        })

        companyBannerId =
          typeof bannerResult.id === 'number' ? bannerResult.id : Number(bannerResult.id)
      } catch (bannerError) {
        console.error('[createPartner] Error uploading company banner:', bannerError)
        return {
          success: false,
          message: 'Failed to upload company banner. Please try again.',
        }
      }
    }

    // Add image IDs to form data
    const formDataWithImages = {
      ...rawFormData,
      companyLogo: companyLogoId,
      companyBanner: companyBannerId,
    }

    // Validate form data using Zod schema
    const validatedFields = partnerSchema.safeParse(formDataWithImages)

    // Return early with field-specific errors if validation fails
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create partner using PayloadCMS Local API
    await payload.create({
      collection: 'partners',
      data: validatedFields.data,
      user,
      overrideAccess: false,
    })

    // Revalidate the partners list page
    revalidatePath('/dash/partners')

    // Redirect to partners list on success
    redirect('/dash/partners')
  } catch (error) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error
    }

    console.error('[createPartner] Error creating partner:', error)

    // Handle Payload validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create partner. Please try again.',
    }
  }
}

/**
 * Server Action to update an existing partner using PayloadCMS Local API
 */
export async function updatePartner(
  partnerId: string,
  prevState: PartnerActionState | undefined,
  formData: FormData,
): Promise<PartnerActionState> {
  try {
    // Extract and transform form data
    const rawFormData = {
      companyName: formData.get('companyName'),
      event: formData.get('event') ? Number(formData.get('event')) : undefined,
      partnerType: formData.get('partnerType') ? Number(formData.get('partnerType')) : undefined,
      contactPerson: formData.get('contactPerson'),
      contactEmail: formData.get('contactEmail'),
      email: formData.get('email') || null,
      fieldOfExpertise: formData.get('fieldOfExpertise') || null,
      companyWebsiteUrl: formData.get('companyWebsiteUrl') || null,
      companyLogoUrl: formData.get('companyLogoUrl') || null,
      companyDescription: formData.get('companyDescription') || null,
      tier: formData.get('tier') ? Number(formData.get('tier')) : null,
      sponsorshipLevel: formData.get('sponsorshipLevel') || null,
      status: formData.get('status') || 'default',
      additionalNotes: formData.get('additionalNotes') || null,
    }

    // Get authenticated user from headers
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to update the partner.',
      }
    }

    // Handle company logo upload if provided
    const companyLogoFile = formData.get('companyLogo') as File | null
    let companyLogoId: number | undefined

    if (companyLogoFile && companyLogoFile.size > 0) {
      try {
        const logoResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Company logo for ${rawFormData.companyName}`,
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

        companyLogoId = typeof logoResult.id === 'number' ? logoResult.id : Number(logoResult.id)
      } catch (logoError) {
        console.error('[updatePartner] Error uploading company logo:', logoError)
        return {
          success: false,
          message: 'Failed to upload company logo. Please try again.',
        }
      }
    }

    // Handle company banner upload if provided
    const companyBannerFile = formData.get('companyBanner') as File | null
    let companyBannerId: number | undefined

    if (companyBannerFile && companyBannerFile.size > 0) {
      try {
        const bannerResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Company banner for ${rawFormData.companyName}`,
          },
          file: {
            data: Buffer.from(await companyBannerFile.arrayBuffer()),
            name: companyBannerFile.name,
            mimetype: companyBannerFile.type,
            size: companyBannerFile.size,
          },
          user,
          overrideAccess: false,
        })

        companyBannerId =
          typeof bannerResult.id === 'number' ? bannerResult.id : Number(bannerResult.id)
      } catch (bannerError) {
        console.error('[updatePartner] Error uploading company banner:', bannerError)
        return {
          success: false,
          message: 'Failed to upload company banner. Please try again.',
        }
      }
    }

    // Add image IDs to form data
    const formDataWithImages = {
      ...rawFormData,
      companyLogo: companyLogoId,
      companyBanner: companyBannerId,
    }

    // Validate form data using Zod schema
    const validatedFields = partnerSchema.safeParse(formDataWithImages)

    // Return early with field-specific errors if validation fails
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Update partner using PayloadCMS Local API
    await payload.update({
      collection: 'partners',
      id: partnerId,
      data: validatedFields.data,
      user,
      overrideAccess: false,
    })

    // Revalidate both the partners list and the specific partner page
    revalidatePath('/dash/partners')
    revalidatePath(`/dash/partners/${partnerId}`)

    // Redirect to partners list on success
    redirect('/dash/partners')
  } catch (error) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error
    }

    console.error('[updatePartner] Error updating partner:', error)

    // Handle Payload validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to update partner. Please try again.',
    }
  }
}
