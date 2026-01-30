/**
 * Email Template Variable Registry
 * Defines all predefined variables available for each trigger event type
 */

import type { TriggerEvent } from './emailAutomation'

export interface VariableDefinition {
  key: string
  description: string
  example: string
}

export interface VariableGroup {
  label: string
  variables: VariableDefinition[]
}

/**
 * Predefined variables for participant-related events
 */
const PARTICIPANT_VARIABLES: VariableDefinition[] = [
  {
    key: 'name',
    description: 'Full name of the participant',
    example: 'John Doe',
  },
  {
    key: 'email',
    description: 'Email address of the participant',
    example: 'john@example.com',
  },
  {
    key: 'status',
    description: 'Current status (not-approved, approved, need-info, cancelled)',
    example: 'approved',
  },
  {
    key: 'participantType',
    description: 'Type of participant',
    example: 'Speaker',
  },
  {
    key: 'event',
    description: 'Event name',
    example: 'Tech Conference 2024',
  },
  {
    key: 'companyName',
    description: 'Company name',
    example: 'Acme Corp',
  },
  {
    key: 'companyPosition',
    description: 'Job title or position',
    example: 'Senior Developer',
  },
  {
    key: 'country',
    description: 'Country of residence',
    example: 'United States',
  },
  {
    key: 'phoneNumber',
    description: 'Phone number',
    example: '+1234567890',
  },
  {
    key: 'registrationDate',
    description: 'Date of registration',
    example: '2024-01-15',
  },
  {
    key: 'socialPostLinkedIn',
    description: 'AI-generated LinkedIn post copy',
    example: 'Excited to announce John Doe as our next speaker...',
  },
  {
    key: 'socialPostTwitter',
    description: 'AI-generated Twitter/X post copy',
    example: 'Next speaker: John Doe - Expert in AI and Machine Learning...',
  },
  {
    key: 'socialPostFacebook',
    description: 'AI-generated Facebook post copy',
    example: '🎤 Our next speaker for Tech Conference 2024 – John Doe...',
  },
  {
    key: 'socialPostInstagram',
    description: 'AI-generated Instagram post copy',
    example: '🎤 Meet our speaker John Doe! Top AI expert...',
  },
  {
    key: 'socialPostGeneratedAt',
    description: 'Date when social posts were generated',
    example: '2024-01-15',
  },
]

/**
 * Predefined variables for partner-related events
 */
const PARTNER_VARIABLES: VariableDefinition[] = [
  {
    key: 'name',
    description: 'Contact person name',
    example: 'Jane Smith',
  },
  {
    key: 'email',
    description: 'Partner contact email',
    example: 'jane@company.com',
  },
  {
    key: 'status',
    description: 'Partner status',
    example: 'invited',
  },
  {
    key: 'partnerType',
    description: 'Type of partnership',
    example: 'Gold Sponsor',
  },
  {
    key: 'partnerTier',
    description: 'Partnership tier level',
    example: 'Premium',
  },
  {
    key: 'companyName',
    description: 'Company name',
    example: 'Tech Solutions Inc',
  },
  {
    key: 'companyWebsite',
    description: 'Company website URL',
    example: 'https://techsolutions.com',
  },
  {
    key: 'contactPerson',
    description: 'Primary contact person',
    example: 'Jane Smith',
  },
  {
    key: 'createdAt',
    description: 'Date partner was added',
    example: '2024-01-15',
  },
  {
    key: 'socialPostLinkedIn',
    description: 'AI-generated LinkedIn post copy',
    example: 'Proud to welcome Tech Solutions Inc as our Gold partner...',
  },
  {
    key: 'socialPostTwitter',
    description: 'AI-generated Twitter/X post copy',
    example: 'Welcome Tech Solutions Inc as our Gold partner for...',
  },
  {
    key: 'socialPostFacebook',
    description: 'AI-generated Facebook post copy',
    example: '🤝 Excited to announce Tech Solutions Inc as our partner...',
  },
  {
    key: 'socialPostInstagram',
    description: 'AI-generated Instagram post copy',
    example: '🤝 Meet our partner Tech Solutions Inc! Industry leaders...',
  },
  {
    key: 'socialPostGeneratedAt',
    description: 'Date when social posts were generated',
    example: '2024-01-15',
  },
]

/**
 * Common variables available for all email templates
 */
const COMMON_VARIABLES: VariableDefinition[] = [
  {
    key: 'tenantName',
    description: 'Name of your organization',
    example: 'My Organization',
  },
  {
    key: 'currentYear',
    description: 'Current year',
    example: '2024',
  },
]

/**
 * Event-specific variable mappings
 */
const EVENT_VARIABLE_MAP: Record<TriggerEvent | 'none', VariableGroup[]> = {
  'participant.created': [
    { label: 'Participant Information', variables: PARTICIPANT_VARIABLES },
    { label: 'Common Variables', variables: COMMON_VARIABLES },
  ],
  'participant.updated': [
    { label: 'Participant Information', variables: PARTICIPANT_VARIABLES },
    { label: 'Common Variables', variables: COMMON_VARIABLES },
  ],
  'partner.invited': [
    { label: 'Partner Information', variables: PARTNER_VARIABLES },
    { label: 'Common Variables', variables: COMMON_VARIABLES },
  ],
  'event.published': [
    { label: 'Event Information', variables: [] }, // Can be extended when this trigger is implemented
    { label: 'Common Variables', variables: COMMON_VARIABLES },
  ],
  'form.submitted': [
    { label: 'Form Data', variables: [] }, // Can be extended when this trigger is implemented
    { label: 'Common Variables', variables: COMMON_VARIABLES },
  ],
  custom: [{ label: 'Common Variables', variables: COMMON_VARIABLES }],
  none: [{ label: 'Common Variables', variables: COMMON_VARIABLES }],
}

/**
 * Get all available variables for a specific trigger event
 */
export function getAvailableVariables(triggerEvent: TriggerEvent | 'none'): VariableGroup[] {
  return EVENT_VARIABLE_MAP[triggerEvent] || EVENT_VARIABLE_MAP.none
}

/**
 * Get ALL variables (Participant + Partner + Common) regardless of trigger event
 * Useful for the Variables tab to show complete reference
 */
export function getAllVariables(): VariableGroup[] {
  return [
    { label: 'Participant Variables', variables: PARTICIPANT_VARIABLES },
    { label: 'Partner Variables', variables: PARTNER_VARIABLES },
    { label: 'Common Variables', variables: COMMON_VARIABLES },
  ]
}

/**
 * Get a flat list of all variable keys for a trigger event
 */
export function getVariableKeys(triggerEvent: TriggerEvent | 'none'): string[] {
  const groups = getAvailableVariables(triggerEvent)
  const allVariables = groups.flatMap((group) => group.variables)
  return allVariables.map((v) => v.key)
}

/**
 * Build standardized variables object for participant events
 */
export function buildParticipantVariables(participant: {
  name?: string
  email?: string
  status?: string
  participantType?: string
  event?: string
  companyName?: string | null
  companyPosition?: string | null
  country?: string | null
  phoneNumber?: string | null
  registrationDate?: string | null
  socialPostLinkedIn?: string | null
  socialPostTwitter?: string | null
  socialPostFacebook?: string | null
  socialPostInstagram?: string | null
  socialPostGeneratedAt?: string | null
}): Record<string, any> {
  return {
    name: participant.name || '',
    email: participant.email || '',
    status: participant.status || '',
    participantType: participant.participantType || '',
    event: participant.event || '',
    companyName: participant.companyName || '',
    companyPosition: participant.companyPosition || '',
    country: participant.country || '',
    phoneNumber: participant.phoneNumber || '',
    registrationDate: participant.registrationDate || new Date().toISOString().split('T')[0],
    socialPostLinkedIn: participant.socialPostLinkedIn || '',
    socialPostTwitter: participant.socialPostTwitter || '',
    socialPostFacebook: participant.socialPostFacebook || '',
    socialPostInstagram: participant.socialPostInstagram || '',
    socialPostGeneratedAt: participant.socialPostGeneratedAt || '',
  }
}

/**
 * Build standardized variables object for partner events
 */
export function buildPartnerVariables(partner: {
  name?: string
  email?: string
  status?: string
  partnerType?: string
  partnerTier?: string
  companyName?: string
  companyWebsite?: string | null
  contactPerson?: string | null
  createdAt?: string
  socialPostLinkedIn?: string | null
  socialPostTwitter?: string | null
  socialPostFacebook?: string | null
  socialPostInstagram?: string | null
  socialPostGeneratedAt?: string | null
}): Record<string, any> {
  return {
    name: partner.contactPerson || partner.name || '',
    email: partner.email || '',
    status: partner.status || 'invited',
    partnerType: partner.partnerType || '',
    partnerTier: partner.partnerTier || '',
    companyName: partner.companyName || '',
    companyWebsite: partner.companyWebsite || '',
    contactPerson: partner.contactPerson || '',
    createdAt: partner.createdAt
      ? new Date(partner.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    socialPostLinkedIn: partner.socialPostLinkedIn || '',
    socialPostTwitter: partner.socialPostTwitter || '',
    socialPostFacebook: partner.socialPostFacebook || '',
    socialPostInstagram: partner.socialPostInstagram || '',
    socialPostGeneratedAt: partner.socialPostGeneratedAt || '',
  }
}

/**
 * Add common variables to any variables object
 */
export function addCommonVariables(
  variables: Record<string, any>,
  organization?: { name?: string },
): Record<string, any> {
  return {
    ...variables,
    tenantName: organization?.name || 'Organization',
    currentYear: new Date().getFullYear().toString(),
  }
}

/**
 * Format variable reference for display in admin UI
 */
export function formatVariableReference(triggerEvent: TriggerEvent | 'none'): string {
  const groups = getAvailableVariables(triggerEvent)

  let reference = '# Available Variables\n\n'
  reference +=
    'Use these variables in your email subject and body using {{variableName}} syntax.\n\n'

  for (const group of groups) {
    if (group.variables.length === 0) continue

    reference += `## ${group.label}\n\n`

    for (const variable of group.variables) {
      reference += `- **{{${variable.key}}}** - ${variable.description}\n`
      reference += `  Example: "${variable.example}"\n\n`
    }
  }

  reference += '---\n\n'
  reference += '**Example usage:**\n'
  reference += 'Subject: Welcome {{name}} to {{event}}!\n'
  reference += 'Body: Hello {{name}}, thank you for registering...\n'

  return reference
}
