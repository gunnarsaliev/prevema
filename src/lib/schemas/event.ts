import { z } from 'zod'

export const eventSchema = z
  .object({
    // Sent in the POST/PATCH body so Payload knows which org this event belongs to.
    // Optional only when the user has exactly one org (the autoSelectOrganization hook handles it).
    organization: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    status: z.enum(['planning', 'open', 'closed', 'archived']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullish(),
    timezone: z.string().nullish(),
    description: z.string().nullish(),
    eventType: z.enum(['physical', 'online']),
    address: z.string().nullish(),
    why: z.string().nullish(),
    what: z.string().nullish(),
    where: z.string().nullish(),
    who: z.string().nullish(),
    theme: z.string().nullish(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) >= new Date(data.startDate)
      }
      return true
    },
    { message: 'End date must be on or after start date', path: ['endDate'] },
  )

export type EventFormValues = z.infer<typeof eventSchema>
