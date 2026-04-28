import { z } from 'zod'

export const profileSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    newEmail: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.newEmail && d.newEmail.trim() !== '') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.newEmail)
      }
      return true
    },
    { message: 'Invalid email address', path: ['newEmail'] },
  )
  .refine(
    (d) => {
      const changingEmail = !!d.newEmail?.trim()
      const changingPassword = !!d.newPassword?.trim()
      if ((changingEmail || changingPassword) && !d.currentPassword?.trim()) {
        return false
      }
      return true
    },
    {
      message: 'Current password is required to change email or password',
      path: ['currentPassword'],
    },
  )
  .refine(
    (d) => {
      if (d.newPassword?.trim()) {
        return d.newPassword.length >= 8
      }
      return true
    },
    { message: 'New password must be at least 8 characters', path: ['newPassword'] },
  )
  .refine(
    (d) => {
      if (d.newPassword?.trim()) {
        return d.newPassword === d.confirmPassword
      }
      return true
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )

export type ProfileFormValues = z.infer<typeof profileSchema>
