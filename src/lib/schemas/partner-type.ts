import { z } from 'zod'

const partnerFieldValues = [
  'companyLogo',
  'companyLogoUrl',
  'companyBanner',
  'companyDescription',
  'companyWebsiteUrl',
  'fieldOfExpertise',
  'email',
  'socialLinks',
  'sponsorshipLevel',
  'additionalNotes',
] as const

export type PartnerFieldValue = (typeof partnerFieldValues)[number]

export const PARTNER_FIELD_OPTIONS: { label: string; value: PartnerFieldValue }[] = [
  { label: 'Company Logo', value: 'companyLogo' },
  { label: 'Company Logo URL', value: 'companyLogoUrl' },
  { label: 'Company Banner', value: 'companyBanner' },
  { label: 'Company Description', value: 'companyDescription' },
  { label: 'Company Website URL', value: 'companyWebsiteUrl' },
  { label: 'Field of Expertise', value: 'fieldOfExpertise' },
  { label: 'Email', value: 'email' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Sponsorship Level', value: 'sponsorshipLevel' },
  { label: 'Additional Notes', value: 'additionalNotes' },
]

export const partnerTypeSchema = z.object({
  organization: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullish(),
  event: z.number().nullish(),
  isActive: z.boolean().default(true),
  requiredFields: z.array(z.enum(partnerFieldValues)).default([]),
  showOptionalFields: z.boolean().default(false),
  optionalFields: z.array(z.enum(partnerFieldValues)).default([]),
})

export type PartnerTypeFormValues = z.infer<typeof partnerTypeSchema>
