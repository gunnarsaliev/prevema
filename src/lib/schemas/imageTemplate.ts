import { z } from 'zod'

const imageTemplateSchemaBase = z.object({
  name: z.string().min(1, 'Template name is required'),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  isPremium: z.boolean(),
  width: z.number().min(1, 'Width must be greater than 0'),
  height: z.number().min(1, 'Height must be greater than 0'),
  backgroundImage: z.number().nullish(), // Media ID
  backgroundColor: z.string().nullish(),
  elements: z.string().min(1, 'Elements are required'), // JSON string
  previewImage: z.number().nullish(), // Media ID
})

export const imageTemplateSchema = imageTemplateSchemaBase.extend({
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  isPremium: z.boolean().default(false),
})

export type ImageTemplateFormValues = z.infer<typeof imageTemplateSchemaBase>
