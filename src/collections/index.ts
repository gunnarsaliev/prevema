import type { CollectionConfig } from 'payload'
import {
  teamAwareRead,
  teamAwareCreate,
  teamAwareUpdate,
  teamAwareDelete,
} from '../../access/teamAwareAccess'
import { generatePublicFormLink } from './hooks/generatePublicFormLink'
import { syncOptionalFields } from './hooks/syncOptionalFields'
import { validatePartnerFields } from './hooks/validateFields'
import { autoSelectTeam } from '@/hooks/autoSelectTeam'
import { defaultTeamValue } from '@/fields/defaultTeamValue'
import { defaultEventValue } from '@/fields/defaultEventValue'
import { formatSlugHook } from '@/utils/formatSlug'

const partnerFieldOptions = [
  { label: 'Company Logo', value: 'companyLogo' },
  { label: 'Company Logo URL', value: 'companyLogoUrl' },
  { label: 'Company Banner', value: 'companyBanner' },
  { label: 'Company Description', value: 'companyDescription' },
  { label: 'Company Website URL', value: 'companyWebsiteUrl' },
  { label: 'Field of Expertise', value: 'fieldOfExpertise' },
  { label: 'Email', value: 'email' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Sponsorship Level', value: 'sponsorshipLevel' },
  { label: 'Additional Notes', value: 'additionalNotes' },
]

export const PartnerTypes: CollectionConfig = {
  slug: 'partner-types',
  admin: {
    useAsTitle: 'name',
    group: 'Event Planning',
  },
  access: {
    read: teamAwareRead,
    create: teamAwareCreate,
    update: teamAwareUpdate,
    delete: teamAwareDelete,
  },
  fields: [
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      defaultValue: defaultTeamValue,
      admin: {
        description: 'The team this partner type belongs to',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      hooks: {
        beforeValidate: [formatSlugHook('name')],
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
      defaultValue: defaultEventValue,
      admin: {
        description:
          'Optional: Link this partner type to a specific event. If set, the public form will be for this event only.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'requiredFields',
      type: 'select',
      hasMany: true,
      options: partnerFieldOptions,
      admin: {
        position: 'sidebar',
        description: 'Select which fields are required in the public registration form',
        components: {
          Field: {
            path: '@/components/fields/FilteredSelectField',
            clientProps: {
              excludeFieldPath: 'optionalFields',
              allOptions: partnerFieldOptions,
            },
          },
        },
      },
    },
    {
      name: 'showOptionalFields',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Enable optional fields selection. When enabled, you can mark displayed fields as optional.',
      },
    },
    {
      name: 'optionalFields',
      type: 'select',
      hasMany: true,
      options: partnerFieldOptions,
      admin: {
        position: 'sidebar',
        description:
          'Select which fields are optional (shown but not required). Required fields are excluded automatically.',
        condition: (data) => data?.showOptionalFields === true,
        components: {
          Field: {
            path: '@/components/fields/FilteredSelectField',
            clientProps: {
              excludeFieldPath: 'requiredFields',
              allOptions: partnerFieldOptions,
            },
          },
        },
      },
    },
    {
      name: 'publicFormLink',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Share this link with companies to register as this partner type',
        components: {
          Field: {
            path: '@/components/fields/PublicFormLinkField',
            clientProps: {
              baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
            },
          },
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [autoSelectTeam, validatePartnerFields, syncOptionalFields],
    afterChange: [generatePublicFormLink],
  },
}
