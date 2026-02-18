import { z } from 'zod'

const participantFieldValues = [
  'imageUrl',
  'biography',
  'country',
  'phoneNumber',
  'companyLogoUrl',
  'companyName',
  'companyPosition',
  'companyWebsite',
  'socialLinks',
  'presentationTopic',
  'presentationSummary',
  'technicalRequirements',
] as const

export type ParticipantFieldValue = (typeof participantFieldValues)[number]

export const PARTICIPANT_FIELD_OPTIONS: { label: string; value: ParticipantFieldValue }[] = [
  { label: 'Profile Photo', value: 'imageUrl' },
  { label: 'Biography', value: 'biography' },
  { label: 'Country', value: 'country' },
  { label: 'Phone Number', value: 'phoneNumber' },
  { label: 'Company Logo', value: 'companyLogoUrl' },
  { label: 'Company Name', value: 'companyName' },
  { label: 'Company Position', value: 'companyPosition' },
  { label: 'Company Website', value: 'companyWebsite' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Presentation Topic', value: 'presentationTopic' },
  { label: 'Presentation Summary', value: 'presentationSummary' },
  { label: 'Technical Requirements', value: 'technicalRequirements' },
]

export const participantTypeSchema = z.object({
  organization: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullish(),
  event: z.number().nullish(),
  isActive: z.boolean().default(true),
  requiredFields: z.array(z.enum(participantFieldValues)).default([]),
  showOptionalFields: z.boolean().default(false),
  optionalFields: z.array(z.enum(participantFieldValues)).default([]),
})

export type ParticipantTypeFormValues = z.infer<typeof participantTypeSchema>
