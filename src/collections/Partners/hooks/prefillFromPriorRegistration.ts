import type { CollectionBeforeChangeHook } from 'payload'

const COMPANY_FIELDS = [
  'companyLogo',
  'companyLogoUrl',
  'companyBanner',
  'companyDescription',
  'companyWebsiteUrl',
  'fieldOfExpertise',
  'socialLinks',
] as const

export const prefillFromPriorRegistration: CollectionBeforeChangeHook = async ({
  req,
  data,
  operation,
}) => {
  if (operation !== 'create') return data
  if (!data.contactEmail || !data.organization) return data

  try {
    const { docs } = await req.payload.find({
      collection: 'partners',
      where: {
        and: [
          { contactEmail: { equals: data.contactEmail } },
          { organization: { equals: data.organization } },
        ],
      },
      sort: '-registrationDate',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const prior = docs[0]
    if (!prior) return data

    for (const field of COMPANY_FIELDS) {
      const incoming = (data as any)[field]
      const isEmpty =
        incoming == null ||
        incoming === '' ||
        (Array.isArray(incoming) && incoming.length === 0)
      if (isEmpty && (prior as any)[field] != null) {
        ;(data as any)[field] = (prior as any)[field]
      }
    }
  } catch (err) {
    req.payload.logger.error({ err }, 'prefillFromPriorRegistration (partners) failed')
  }

  return data
}
