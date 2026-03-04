'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

type RegisterParticipantResult =
  | { success: true; id: number | string }
  | { success: false; error: string }

function parsePayloadError(err: unknown): string {
  if (!(err instanceof Error)) return 'Failed to submit registration'

  const msg = err.message

  if (msg.toLowerCase().includes('unique') && msg.toLowerCase().includes('email')) {
    return 'This email is already registered for this event'
  }

  // Payload validation errors are sometimes nested as JSON in the message
  try {
    const parsed = JSON.parse(msg) as { errors?: Array<{ message?: string }> }
    if (parsed.errors?.length) {
      const emailErr = parsed.errors.find((e) => e.message?.toLowerCase().includes('email'))
      if (emailErr) return 'This email is already registered for this event'
      return parsed.errors.map((e) => e.message ?? 'Unknown error').join(', ')
    }
  } catch {
    // not JSON — fall through
  }

  return msg
}

export async function registerParticipant(
  formData: FormData,
): Promise<RegisterParticipantResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    const name = formData.get('name') as string

    // ── Upload profile photo ─────────────────────────────────────────────────
    let imageUrlId: number | string | undefined
    const imageFile = formData.get('imageUrl') as File | null
    if (imageFile && imageFile.size > 0) {
      const imageResult = await payload.create({
        collection: 'media',
        data: { alt: `Profile photo for ${name}` },
        file: {
          data: Buffer.from(await imageFile.arrayBuffer()),
          name: imageFile.name,
          mimetype: imageFile.type,
          size: imageFile.size,
        },
        overrideAccess: true,
      })
      if (!imageResult) {
        throw new Error('Failed to upload profile photo')
      }
      imageUrlId = imageResult.id
    }

    // ── Upload company logo ──────────────────────────────────────────────────
    let companyLogoUrlId: number | string | undefined
    const logoFile = formData.get('companyLogoUrl') as File | null
    if (logoFile && logoFile.size > 0) {
      const logoResult = await payload.create({
        collection: 'media',
        data: {
          alt: `Company logo for ${(formData.get('companyName') as string | null) ?? name}`,
        },
        file: {
          data: Buffer.from(await logoFile.arrayBuffer()),
          name: logoFile.name,
          mimetype: logoFile.type,
          size: logoFile.size,
        },
        overrideAccess: true,
      })
      if (!logoResult) {
        throw new Error('Failed to upload company logo')
      }
      companyLogoUrlId = logoResult.id
    }

    // ── Parse social links ───────────────────────────────────────────────────
    const socialLinksRaw = formData.get('socialLinks') as string | null
    const socialLinks: Array<{ platform: string; url: string }> = socialLinksRaw
      ? (JSON.parse(socialLinksRaw) as Array<{ platform: string; url: string }>)
      : []

    // ── Assemble participant data ────────────────────────────────────────────
    const eventId = formData.get('event') as string
    const participantTypeId = formData.get('participantType') as string

    const participantData: Record<string, unknown> = {
      name,
      email: formData.get('email') as string,
      event: parseInt(eventId, 10),
      participantType: parseInt(participantTypeId, 10),
      status: 'not-approved',
    }

    // Optional text fields — only set if provided
    const optionalTextFields = [
      'biography',
      'country',
      'phoneNumber',
      'companyName',
      'companyPosition',
      'companyWebsite',
      'presentationTopic',
      'presentationSummary',
      'technicalRequirements',
    ] as const

    for (const field of optionalTextFields) {
      const val = formData.get(field) as string | null
      if (val) participantData[field] = val
    }

    if (imageUrlId !== undefined) participantData.imageUrl = imageUrlId
    if (companyLogoUrlId !== undefined) participantData.companyLogoUrl = companyLogoUrlId
    if (socialLinks.length > 0) participantData.socialLinks = socialLinks

    // ── Create participant via Local API ─────────────────────────────────────
    // overrideAccess: false → publicParticipantCreate runs → returns true for !user
    const participant = await payload.create({
      collection: 'participants',
      data: participantData as any,
      draft: false,
      overrideAccess: false,
    })

    if (!participant) {
      throw new Error('Failed to create participant record')
    }

    return { success: true, id: participant.id }
  } catch (err) {
    return { success: false, error: parsePayloadError(err) }
  }
}
