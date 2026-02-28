'use server'

import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  onboardingOrganizationSchema,
  organizationSchema,
  type OnboardingOrganizationFormValues,
} from '@/lib/schemas/organization'
import { eventSchema, type EventFormValues } from '@/lib/schemas/event'
import { participantTypeSchema } from '@/lib/schemas/participant-type'
import { partnerTypeSchema } from '@/lib/schemas/partner-type'
import { emailTemplateSchema } from '@/lib/schemas/emailTemplate'

// Action state types
export type OnboardingActionState<T = any> = {
  success?: boolean
  message?: string
  data?: T
  errors?: {
    [K in keyof any]?: string[]
  }
}

/**
 * Create organization during onboarding
 */
export async function createOrganizationAction(
  prevState: OnboardingActionState | undefined,
  formData: FormData,
): Promise<OnboardingActionState<{ id: number; name: string }>> {
  try {
    const rawFormData = {
      name: formData.get('name'),
    }

    // Validate
    const validatedFields = onboardingOrganizationSchema.safeParse(rawFormData)

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get authenticated user
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    // Create organization
    const organization = await payload.create({
      collection: 'organizations',
      data: {
        name: validatedFields.data.name,
        owner: user.id,
      },
      user,
      overrideAccess: false,
    })

    const orgId = typeof organization.id === 'number' ? organization.id : Number(organization.id)

    revalidatePath('/dash')

    return {
      success: true,
      message: 'Organization created successfully',
      data: {
        id: orgId,
        name: organization.name,
      },
    }
  } catch (error) {
    console.error('[createOrganizationAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create organization. Please try again.',
    }
  }
}

/**
 * Get user's first organization
 */
export async function getUserOrganizationAction(): Promise<
  OnboardingActionState<{
    id: number
    name: string
    emailConfig?: {
      isActive?: boolean
      senderName?: string
      fromEmail?: string
      replyToEmail?: string
      resendApiKey?: string
    }
  }>
> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    // Fetch user's organizations
    const organizations = await payload.find({
      collection: 'organizations',
      where: {
        owner: {
          equals: user.id,
        },
      },
      limit: 1,
      user,
    })

    if (!organizations.docs || organizations.docs.length === 0) {
      return {
        success: false,
        message: 'No organization found. Please contact support.',
      }
    }

    const org = organizations.docs[0]
    const orgId = typeof org.id === 'number' ? org.id : Number(org.id)

    return {
      success: true,
      data: {
        id: orgId,
        name: org.name,
        emailConfig: org.emailConfig,
      },
    }
  } catch (error) {
    console.error('[getUserOrganizationAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to fetch organization. Please try again.',
    }
  }
}

/**
 * Update organization during onboarding
 */
export async function updateOrganizationAction(
  organizationId: number,
  prevState: OnboardingActionState | undefined,
  formData: FormData,
): Promise<OnboardingActionState<{ id: number; name: string }>> {
  try {
    const rawFormData = {
      name: formData.get('name'),
      emailConfig: {
        isActive: formData.get('emailConfigIsActive') === 'true',
        senderName: formData.get('senderName') || undefined,
        fromEmail: formData.get('fromEmail') || undefined,
        replyToEmail: formData.get('replyToEmail') || undefined,
        resendApiKey: formData.get('resendApiKey') || undefined,
      },
    }

    // Validate
    const validatedFields = organizationSchema.safeParse(rawFormData)

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get authenticated user
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    // First verify user owns this organization
    const existingOrg = await payload.findByID({
      collection: 'organizations',
      id: organizationId,
      user,
    })

    if (!existingOrg) {
      return {
        success: false,
        message: 'Organization not found.',
      }
    }

    // Check if user is the owner
    const ownerId = typeof existingOrg.owner === 'object' ? existingOrg.owner.id : existingOrg.owner
    if (ownerId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to update this organization.',
      }
    }

    // Update organization - use overrideAccess since we've verified ownership
    const organization = await payload.update({
      collection: 'organizations',
      id: organizationId,
      data: {
        name: validatedFields.data.name,
        emailConfig: validatedFields.data.emailConfig,
      },
      overrideAccess: true,
    })

    const orgId = typeof organization.id === 'number' ? organization.id : Number(organization.id)

    revalidatePath('/dash')

    return {
      success: true,
      message: 'Organization updated successfully',
      data: {
        id: orgId,
        name: organization.name,
      },
    }
  } catch (error) {
    console.error('[updateOrganizationAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to update organization. Please try again.',
    }
  }
}

/**
 * Create event during onboarding
 */
export async function createEventAction(
  organizationId: number,
  prevState: OnboardingActionState | undefined,
  formData: FormData,
): Promise<OnboardingActionState<{ id: number; name: string }>> {
  try {
    const rawFormData = {
      organization: organizationId,
      name: formData.get('name'),
      status: 'planning',
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      eventType: formData.get('eventType') || 'online',
      address: formData.get('address') || null,
      description: formData.get('description') || null,
      theme: formData.get('theme') || null,
      why: formData.get('why') || null,
      what: formData.get('what') || null,
      where: formData.get('where') || null,
      who: formData.get('who') || null,
    }

    // Validate
    const validatedFields = eventSchema.safeParse(rawFormData)

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get authenticated user
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    // Handle image upload if provided
    const imageFile = formData.get('image') as File | null
    let imageId: number | undefined

    if (imageFile && imageFile.size > 0) {
      try {
        const imageResult = await payload.create({
          collection: 'media',
          data: {
            alt: `Event image for ${validatedFields.data.name}`,
          },
          file: {
            data: Buffer.from(await imageFile.arrayBuffer()),
            name: imageFile.name,
            mimetype: imageFile.type,
            size: imageFile.size,
          },
          user,
          overrideAccess: false,
        })

        imageId = typeof imageResult.id === 'number' ? imageResult.id : Number(imageResult.id)
      } catch (imageError) {
        console.error('[createEventAction] Error uploading image:', imageError)
      }
    }

    // Create event
    const eventData: any = {
      ...validatedFields.data,
    }

    if (imageId) {
      eventData.image = imageId
    }

    const event = await payload.create({
      collection: 'events',
      data: eventData,
      user,
      overrideAccess: false,
    })

    const eventId = typeof event.id === 'number' ? event.id : Number(event.id)

    revalidatePath('/dash/events')

    return {
      success: true,
      message: 'Event created successfully',
      data: {
        id: eventId,
        name: event.name,
      },
    }
  } catch (error) {
    console.error('[createEventAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create event. Please try again.',
    }
  }
}

/**
 * Create participant type during onboarding
 */
export async function createParticipantTypeAction(
  organizationId: number,
  eventId: number,
  formData: FormData,
): Promise<OnboardingActionState<{ id: number; name: string; publicFormLink: string }>> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    const rawData = {
      organization: organizationId,
      event: eventId,
      name: formData.get('name'),
      description: formData.get('description') || null,
      requiredFields: formData.getAll('requiredFields'),
      isActive: true,
    }

    const participantType = await payload.create({
      collection: 'participant-types',
      data: rawData as any,
      user,
      overrideAccess: false,
    })

    const typeId =
      typeof participantType.id === 'number' ? participantType.id : Number(participantType.id)

    revalidatePath('/dash/events')

    return {
      success: true,
      message: 'Participant type created successfully',
      data: {
        id: typeId,
        name: participantType.name,
        publicFormLink: participantType.publicFormLink || '',
      },
    }
  } catch (error) {
    console.error('[createParticipantTypeAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create participant type. Please try again.',
    }
  }
}

/**
 * Create partner type during onboarding
 */
export async function createPartnerTypeAction(
  organizationId: number,
  eventId: number,
  formData: FormData,
): Promise<OnboardingActionState<{ id: number; name: string; publicFormLink: string }>> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    const rawData = {
      organization: organizationId,
      event: eventId,
      name: formData.get('name'),
      description: formData.get('description') || null,
      requiredFields: formData.getAll('requiredFields'),
      isActive: true,
    }

    const partnerType = await payload.create({
      collection: 'partner-types',
      data: rawData as any,
      user,
      overrideAccess: false,
    })

    const typeId = typeof partnerType.id === 'number' ? partnerType.id : Number(partnerType.id)

    revalidatePath('/dash/events')

    return {
      success: true,
      message: 'Partner type created successfully',
      data: {
        id: typeId,
        name: partnerType.name,
        publicFormLink: partnerType.publicFormLink || '',
      },
    }
  } catch (error) {
    console.error('[createPartnerTypeAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create partner type. Please try again.',
    }
  }
}

/**
 * Create email template during onboarding
 */
export async function createEmailTemplateAction(
  organizationId: number,
  formData: FormData,
): Promise<OnboardingActionState<{ id: number; name: string }>> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to continue.',
      }
    }

    // Parse htmlBody from rich text format if needed
    let htmlBodyValue = formData.get('htmlBody')
    if (typeof htmlBodyValue === 'string') {
      try {
        // If it's JSON string, parse it (Lexical format)
        htmlBodyValue = JSON.parse(htmlBodyValue)
      } catch {
        // If parsing fails, wrap it in a simple Lexical structure
        htmlBodyValue = {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: htmlBodyValue,
                  },
                ],
              },
            ],
          },
        }
      }
    }

    const rawData = {
      organization: organizationId,
      name: formData.get('name'),
      description: formData.get('description') || null,
      subject: formData.get('subject'),
      htmlBody: htmlBodyValue,
      isActive: true,
    }

    const emailTemplate = await payload.create({
      collection: 'email-templates',
      data: rawData as any,
      user,
      overrideAccess: false,
    })

    const templateId =
      typeof emailTemplate.id === 'number' ? emailTemplate.id : Number(emailTemplate.id)

    revalidatePath('/dash')

    return {
      success: true,
      message: 'Email template created successfully',
      data: {
        id: templateId,
        name: emailTemplate.name,
      },
    }
  } catch (error) {
    console.error('[createEmailTemplateAction] Error:', error)

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to create email template. Please try again.',
    }
  }
}

/**
 * Record social post preference during onboarding
 */
export async function recordSocialPostPreferenceAction(
  organizationId: number,
  preference: 'own' | 'create',
): Promise<OnboardingActionState> {
  try {
    // For now, just return success. This can be extended to save preference to a user profile
    // or organization settings if needed later
    return {
      success: true,
      message: 'Preference saved',
      data: { preference },
    }
  } catch (error) {
    console.error('[recordSocialPostPreferenceAction] Error:', error)

    return {
      success: false,
      message: 'Failed to save preference.',
    }
  }
}
