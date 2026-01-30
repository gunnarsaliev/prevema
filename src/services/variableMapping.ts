import type { Participant } from '@/payload-types'
import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utils/getURL'

/**
 * Mapping of variable types to participant field names
 */
export const VARIABLE_FIELD_MAPPING: Record<string, string> = {
  // Text variables
  NAME: 'name',
  EMAIL: 'email',
  COMPANY_NAME: 'companyName',
  COMPANY_POSITION: 'companyPosition',
  PHONE_NUMBER: 'phoneNumber',
  COUNTRY: 'country',
  COMPANY_WEBSITE: 'companyWebsite',
  PRESENTATION_TOPIC: 'presentationTopic',

  // Image variables
  PROFILE_IMAGE: 'imageUrl',
  COMPANY_LOGO: 'companyLogoUrl',
  COMPANY_BANNER: 'companyLogoUrl', // Fallback to logo if no banner field
}

/**
 * Service for mapping template variables to participant data
 */
export class VariableMappingService {
  /**
   * Get participant field value by variable type for text variables
   * @param variableType - The variable type (e.g., "NAME", "EMAIL")
   * @param participant - The participant object
   * @returns The field value as a string, or empty string if not found
   */
  getFieldValue(variableType: string, participant: Participant): string {
    const fieldName = VARIABLE_FIELD_MAPPING[variableType]

    if (!fieldName) {
      return ''
    }

    const value = participant[fieldName as keyof Participant]

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return ''
    }

    // Convert to string
    return String(value)
  }

  /**
   * Get participant image URL by variable type for image variables
   * Converts relative URLs to absolute URLs for server-side image loading
   * @param variableType - The variable type (e.g., "PROFILE_IMAGE", "COMPANY_LOGO")
   * @param participant - The participant object
   * @returns The absolute image URL as a string, or null if not found
   */
  async getImageUrl(variableType: string, participant: Participant): Promise<string | null> {
    const fieldName = VARIABLE_FIELD_MAPPING[variableType]

    if (!fieldName) {
      return null
    }

    const value = participant[fieldName as keyof Participant]

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return null
    }

    let url: string | null = null

    // If it's a Media object, extract the URL
    if (typeof value === 'object' && 'url' in value) {
      const media = value as Media
      url = media.url || null
    }
    // If it's already a string (direct URL), use it
    else if (typeof value === 'string') {
      url = value
    }

    // Convert relative URLs to absolute URLs
    if (url && url.startsWith('/')) {
      const baseUrl = getServerSideURL()
      return `${baseUrl}${url}`
    }

    return url
  }
}
