import { z } from 'zod'

export const imageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  usageType: z.enum(['participant', 'partner', 'both']).default('participant'),
  isActive: z.boolean().default(true),
  width: z.number().min(1, 'Width must be greater than 0'),
  height: z.number().min(1, 'Height must be greater than 0'),
  backgroundImage: z.number().nullish(), // Media ID
  backgroundColor: z.string().nullish(),
  elements: z.string().min(1, 'Elements are required'), // JSON string
  previewImage: z.number().nullish(), // Media ID
})

export type ImageTemplateFormValues = z.infer<typeof imageTemplateSchema>
