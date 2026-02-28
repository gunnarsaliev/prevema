import { z } from 'zod'

export const organizationSchema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters'),
  emailConfig: z
    .object({
      isActive: z.boolean().optional(),
      senderName: z.string().optional(),
      fromEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
      replyToEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
      resendApiKey: z.string().optional(),
    })
    .optional(),
})

export type OrganizationFormValues = z.infer<typeof organizationSchema>

// Minimal schema for onboarding (only required fields)
export const onboardingOrganizationSchema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters'),
})

export type OnboardingOrganizationFormValues = z.infer<typeof onboardingOrganizationSchema>
