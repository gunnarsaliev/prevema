import { BeforeValidateHook } from 'payload'

// Valid field names that exist in the Participants collection
const VALID_PARTICIPANT_FIELDS = [
  'imageUrl',
  'biography',
  'country',
  'phoneNumber',
  'companyLogoUrl',
  'companyName',
  'companyPosition',
  'companyWebsite',
  'socialLinks',
  'presentationTopic',
  'presentationSummary',
  'technicalRequirements',
]

export const validateParticipantFields: BeforeValidateHook = ({ data }) => {
  if (!data) return data

  // Validate requiredFields
  if (data.requiredFields && Array.isArray(data.requiredFields)) {
    const invalidFields = data.requiredFields.filter(
      (field: string) => !VALID_PARTICIPANT_FIELDS.includes(field)
    )
    if (invalidFields.length > 0) {
      throw new Error(
        `Invalid required fields: ${invalidFields.join(', ')}. Valid fields are: ${VALID_PARTICIPANT_FIELDS.join(', ')}`
      )
    }
  }

  // Validate optionalFields
  if (data.optionalFields && Array.isArray(data.optionalFields)) {
    const invalidFields = data.optionalFields.filter(
      (field: string) => !VALID_PARTICIPANT_FIELDS.includes(field)
    )
    if (invalidFields.length > 0) {
      throw new Error(
        `Invalid optional fields: ${invalidFields.join(', ')}. Valid fields are: ${VALID_PARTICIPANT_FIELDS.join(', ')}`
      )
    }
  }

  return data
}

