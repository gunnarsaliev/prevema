import { z } from 'zod'

const optionalEmail = z
  .string()
  .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Invalid email address',
  })
  .optional()

export const orgSettingsSchema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters'),
  senderName: z.string().optional(),
  fromEmail: optionalEmail,
  replyToEmail: optionalEmail,
  resendApiKey: z.string().optional(),
})

export type OrgSettingsFormValues = z.infer<typeof orgSettingsSchema>
