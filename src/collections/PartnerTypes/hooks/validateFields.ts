import type { CollectionBeforeValidateHook } from 'payload'

// Valid field names that exist in the Partners collection
const VALID_PARTNER_FIELDS = [
  'companyLogo',
  'companyLogoUrl',
  'companyBanner',
  'companyDescription',
  'companyWebsiteUrl',
  'fieldOfExpertise',
  'email',
  'socialLinks',
  'sponsorshipLevel',
  'additionalNotes',
]

export const validatePartnerFields: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data

  // Validate requiredFields
  if (data.requiredFields && Array.isArray(data.requiredFields)) {
    const invalidFields = data.requiredFields.filter(
      (field: string) => !VALID_PARTNER_FIELDS.includes(field),
    )
    if (invalidFields.length > 0) {
      throw new Error(
        `Invalid required fields: ${invalidFields.join(', ')}. Valid fields are: ${VALID_PARTNER_FIELDS.join(', ')}`,
      )
    }
  }

  // Validate optionalFields
  if (data.optionalFields && Array.isArray(data.optionalFields)) {
    const invalidFields = data.optionalFields.filter(
      (field: string) => !VALID_PARTNER_FIELDS.includes(field),
    )
    if (invalidFields.length > 0) {
      throw new Error(
        `Invalid optional fields: ${invalidFields.join(', ')}. Valid fields are: ${VALID_PARTNER_FIELDS.join(', ')}`,
      )
    }
  }

  return data
}
