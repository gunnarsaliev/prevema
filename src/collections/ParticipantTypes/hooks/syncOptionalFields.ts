import { BeforeChangeHook } from 'payload'

export const syncOptionalFields: BeforeChangeHook = ({ data }) => {
  if (!data) return data

  const requiredFields = Array.isArray(data.requiredFields) ? data.requiredFields : []
  const optionalFields = Array.isArray(data.optionalFields) ? data.optionalFields : []

  // Remove any optional fields that are also marked as required to keep them mutually exclusive
  const syncedOptionalFields = optionalFields.filter((field: string) => !requiredFields.includes(field))

  return {
    ...data,
    optionalFields: syncedOptionalFields,
  }
}

