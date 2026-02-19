'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

type RegisterPartnerResult =
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
      const emailErr = parsed.errors.find(
        (e) => e.message?.toLowerCase().includes('email'),
      )
      if (emailErr) return 'This email is already registered for this event'
      return parsed.errors.map((e) => e.message ?? 'Unknown error').join(', ')
    }
  } catch {
    // not JSON — fall through
  }

  return msg
}

export async function registerPartner(formData: FormData): Promise<RegisterPartnerResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    const companyName = formData.get('companyName') as string

    // ── Upload company logo ──────────────────────────────────────────────────
    let companyLogoId: number | string | undefined
    const logoFile = formData.get('companyLogo') as File | null
    if (logoFile && logoFile.size > 0) {
      const logoResult = await payload.create({
        collection: 'media',
        data: { alt: `Company logo for ${companyName}` },
        file: {
          data: Buffer.from(await logoFile.arrayBuffer()),
          name: logoFile.name,
          mimetype: logoFile.type,
          size: logoFile.size,
        },
        overrideAccess: true,
      })
      companyLogoId = logoResult.id
    }

    // ── Upload company banner ────────────────────────────────────────────────
    let companyBannerId: number | string | undefined
    const bannerFile = formData.get('companyBanner') as File | null
    if (bannerFile && bannerFile.size > 0) {
      const bannerResult = await payload.create({
        collection: 'media',
        data: { alt: `Company banner for ${companyName}` },
        file: {
          data: Buffer.from(await bannerFile.arrayBuffer()),
          name: bannerFile.name,
          mimetype: bannerFile.type,
          size: bannerFile.size,
        },
        overrideAccess: true,
      })
      companyBannerId = bannerResult.id
    }

    // ── Parse social links ───────────────────────────────────────────────────
    const socialLinksRaw = formData.get('socialLinks') as string | null
    const socialLinks: Array<{ platform: string; url: string }> = socialLinksRaw
      ? (JSON.parse(socialLinksRaw) as Array<{ platform: string; url: string }>)
      : []

    // ── Assemble partner data ────────────────────────────────────────────────
    const eventId = formData.get('event') as string
    const partnerTypeId = formData.get('partnerType') as string

    const partnerData: Record<string, unknown> = {
      companyName,
      contactPerson: formData.get('contactPerson') as string,
      contactEmail: formData.get('contactEmail') as string,
      event: parseInt(eventId, 10),
      partnerType: parseInt(partnerTypeId, 10),
      status: 'default',
    }

    // Optional text fields — only set if provided
    const optionalTextFields = [
      'email',
      'fieldOfExpertise',
      'companyWebsiteUrl',
      'companyLogoUrl',
      'companyDescription',
      'sponsorshipLevel',
      'additionalNotes',
    ] as const

    for (const field of optionalTextFields) {
      const val = formData.get(field) as string | null
      if (val) partnerData[field] = val
    }

    if (companyLogoId !== undefined) partnerData.companyLogo = companyLogoId
    if (companyBannerId !== undefined) partnerData.companyBanner = companyBannerId
    if (socialLinks.length > 0) partnerData.socialLinks = socialLinks

    // ── Create partner via Local API ─────────────────────────────────────────
    // overrideAccess: false → publicPartnerCreate runs → returns true for !user
    const partner = await payload.create({
      collection: 'partners',
      data: partnerData as any,
      draft: false,
      overrideAccess: false,
    })

    return { success: true, id: partner.id }
  } catch (err) {
    return { success: false, error: parsePayloadError(err) }
  }
}
