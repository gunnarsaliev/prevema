import { BeforeChangeHook } from 'payload/dist/collections/config/types'

export const setDefaultStatus: BeforeChangeHook = async ({ req, data, operation }) => {
  // For public submissions (no authenticated user), set default status to not-approved
  if (operation === 'create' && !req.user) {
    data.status = 'not-approved'
    data.registrationDate = new Date().toISOString()
  }

  return data
}
