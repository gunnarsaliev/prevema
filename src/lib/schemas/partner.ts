import { z } from 'zod'

export const partnerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  event: z.number(),
  partnerType: z.number(),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Invalid email address'),
  email: z.string().email('Invalid email address').nullish(),
  fieldOfExpertise: z.string().nullish(),
  companyWebsiteUrl: z.string().nullish(),
  companyLogoUrl: z.string().nullish(),
  companyDescription: z.string().nullish(),
  tier: z.number().nullish(),
  sponsorshipLevel: z.string().nullish(),
  status: z.enum(['default', 'contacted', 'confirmed', 'declined']),
  additionalNotes: z.string().nullish(),
})

export type PartnerFormValues = z.infer<typeof partnerSchema>
