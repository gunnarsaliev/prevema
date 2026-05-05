import type { CollectionBeforeChangeHook } from 'payload'

const PERSON_FIELDS = [
  'imageUrl',
  'companyLogoUrl',
  'biography',
  'country',
  'phoneNumber',
  'companyName',
  'companyPosition',
  'companyWebsite',
  'socialLinks',
] as const

export const prefillFromPriorRegistration: CollectionBeforeChangeHook = async ({
  req,
  data,
  operation,
}) => {
  if (operation !== 'create') return data
  if (!data.email || !data.organization) return data

  try {
    const { docs } = await req.payload.find({
      collection: 'participants',
      where: {
        and: [
          { email: { equals: data.email } },
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

    for (const field of PERSON_FIELDS) {
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
    req.payload.logger.error({ err }, 'prefillFromPriorRegistration (participants) failed')
  }

  return data
}
