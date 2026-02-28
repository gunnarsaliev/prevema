'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { eventSchema, type EventFormValues } from '@/lib/schemas/event'

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

export type EventActionState = {
  success?: boolean
  message?: string
  errors?: {
    [K in keyof EventFormValues]?: string[]
  }
}

/**
 * Server Action to create a new event using PayloadCMS Local API
 * Follows Next.js best practices:
 * - Direct server-side execution (no API route overhead)
 * - Zod validation
 * - Proper error handling
 * - Cache revalidation
 * - Access control enforcement
 */
export async function createEvent(
  prevState: EventActionState | undefined,
  formData: FormData,
): Promise<EventActionState> {
  try {
    // Extract and transform form data
    const rawFormData = {
      organization: formData.get('organization')
        ? Number(formData.get('organization'))
        : undefined,
      name: formData.get('name'),
      status: formData.get('status'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      timezone: formData.get('timezone') || null,
      description: formData.get('description') || null,
      eventType: formData.get('eventType'),
      address: formData.get('address') || null,
      why: formData.get('why') || null,
      what: formData.get('what') || null,
      where: formData.get('where') || null,
      who: formData.get('who') || null,
      theme: formData.get('theme') || null,
    }

    // Validate form data using Zod schema
    const validatedFields = eventSchema.safeParse(rawFormData)

    // Return early with field-specific errors if validation fails
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get authenticated user from headers
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to create an event.',
      }
    }

    // Handle image upload if provided
    const imageFile = formData.get('image') as File | null
    let imageId: number | undefined

    if (imageFile && imageFile.size > 0) {
      try {
        // Upload image to PayloadCMS media collection
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
        console.error('[createEvent] Error uploading image:', imageError)
        return {
          success: false,
          message: 'Failed to upload event image. Please try again.',
        }
      }
    }

    // Create event using PayloadCMS Local API
    // IMPORTANT: Set overrideAccess: false to respect access control
    const eventData: any = {
      ...validatedFields.data,
    }

    if (imageId) {
      eventData.image = imageId
    }

    const event = await payload.create({
      collection: 'events',
      data: eventData,
      user, // Pass authenticated user for access control
      overrideAccess: false, // Enforce access control checks
    })

    // Revalidate the events list page to show the new event
    revalidatePath('/dash/events')

    // Redirect to events list on success
    redirect('/dash/events')
  } catch (error) {
    // Re-throw redirect errors (this is expected behavior in Next.js)
    if (isRedirectError(error)) {
      throw error
    }

    console.error('[createEvent] Error creating event:', error)

    // Handle Payload validation errors
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
 * Server Action to update an existing event using PayloadCMS Local API
 */
export async function updateEvent(
  eventId: string,
  prevState: EventActionState | undefined,
  formData: FormData,
): Promise<EventActionState> {
  try {
    // Extract and transform form data
    const rawFormData = {
      organization: formData.get('organization')
        ? Number(formData.get('organization'))
        : undefined,
      name: formData.get('name'),
      status: formData.get('status'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      timezone: formData.get('timezone') || null,
      description: formData.get('description') || null,
      eventType: formData.get('eventType'),
      address: formData.get('address') || null,
      why: formData.get('why') || null,
      what: formData.get('what') || null,
      where: formData.get('where') || null,
      who: formData.get('who') || null,
      theme: formData.get('theme') || null,
    }

    // Validate form data using Zod schema
    const validatedFields = eventSchema.safeParse(rawFormData)

    // Return early with field-specific errors if validation fails
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get authenticated user from headers
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in to update the event.',
      }
    }

    // Handle image upload if provided
    const imageFile = formData.get('image') as File | null
    let imageId: number | undefined

    if (imageFile && imageFile.size > 0) {
      try {
        // Upload image to PayloadCMS media collection
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
        console.error('[updateEvent] Error uploading image:', imageError)
        return {
          success: false,
          message: 'Failed to upload event image. Please try again.',
        }
      }
    }

    // Update event using PayloadCMS Local API
    // IMPORTANT: Set overrideAccess: false to respect access control
    const eventData: any = {
      ...validatedFields.data,
    }

    if (imageId) {
      eventData.image = imageId
    }

    await payload.update({
      collection: 'events',
      id: eventId,
      data: eventData,
      user, // Pass authenticated user for access control
      overrideAccess: false, // Enforce access control checks
    })

    // Revalidate both the events list and the specific event page
    revalidatePath('/dash/events')
    revalidatePath(`/dash/events/${eventId}`)

    // Redirect to events list on success
    redirect('/dash/events')
  } catch (error) {
    // Re-throw redirect errors (this is expected behavior in Next.js)
    if (isRedirectError(error)) {
      throw error
    }

    console.error('[updateEvent] Error updating event:', error)

    // Handle Payload validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        message: error.message as string,
      }
    }

    return {
      success: false,
      message: 'Failed to update event. Please try again.',
    }
  }
}
