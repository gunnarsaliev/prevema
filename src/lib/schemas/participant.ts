import { z } from 'zod'

export const participantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  event: z.number(),
  participantType: z.number(),
  status: z.enum(['not-approved', 'approved', 'need-info', 'cancelled']),
  biography: z.string().nullish(),
  country: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  companyName: z.string().nullish(),
  companyPosition: z.string().nullish(),
  companyWebsite: z.string().nullish(),
  internalNotes: z.string().nullish(),
  presentationTopic: z.string().nullish(),
  presentationSummary: z.string().nullish(),
  technicalRequirements: z.string().nullish(),
})

export type ParticipantFormValues = z.infer<typeof participantSchema>
