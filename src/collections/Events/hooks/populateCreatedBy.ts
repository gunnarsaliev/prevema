import type { CollectionBeforeChangeHook } from 'payload'

export const populateCreatedBy: CollectionBeforeChangeHook = ({ req, data, operation }) => {
  if (operation === 'create') {
    if (req.user) {
      data.createdBy = req.user.id
      return data
    }
  }
  return data
}
