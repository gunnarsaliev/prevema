import { z } from 'zod'

const emailTemplateSchemaBase = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().nullish(),
  subject: z.string().min(1, 'Email subject is required'),
  htmlBody: z.string().min(1, 'Email body is required'),
  isActive: z.boolean(),
  triggerEvent: z.enum([
    'none',
    'participant.created',
    'participant.updated',
    'partner.invited',
    'event.published',
    'form.submitted',
    'custom',
  ]),
  statusFilter: z.array(z.enum(['not-approved', 'approved', 'need-info', 'cancelled'])).optional(),
  customTriggerName: z.string().nullish(),
  delayMinutes: z.number().min(0),
  conditions: z.string().nullish(),
})

export const emailTemplateSchema = emailTemplateSchemaBase.extend({
  isActive: z.boolean().default(true),
  triggerEvent: z.enum([
    'none',
    'participant.created',
    'participant.updated',
    'partner.invited',
    'event.published',
    'form.submitted',
    'custom',
  ]).default('none'),
  delayMinutes: z.number().min(0).default(0),
})

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchemaBase>
