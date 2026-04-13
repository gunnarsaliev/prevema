import type { CollectionConfig } from 'payload'
import {
  organizationAwareRead,
  organizationAwareCreate,
  organizationAwareUpdate,
  organizationAwareDelete,
} from '../../access/organizationAwareAccess'
import { checkRole } from '@/access/utilities'
import { generatePublicFormLink } from './hooks/generatePublicFormLink'
import { generatePublicFormLinkAfterCreate } from './hooks/generatePublicFormLinkAfterCreate'
import { syncOptionalFields } from './hooks/syncOptionalFields'
import { validateParticipantFields } from './hooks/validateFields'
import { autoSelectOrganization } from '@/hooks/autoSelectOrganization'
import { makeOrgCacheRevalidator } from '@/hooks/revalidateOrgCache'
import { orgRolesTag } from '@/lib/cached-queries'
import { defaultOrganizationValue } from '@/fields/defaultOrganizationValue'

const { afterChange: revalidateCache, afterDelete: revalidateCacheOnDelete } =
  makeOrgCacheRevalidator([orgRolesTag])

const participantFieldOptions = [
  { label: 'Profile Photo', value: 'imageUrl' },
  { label: 'Biography', value: 'biography' },
  { label: 'Country', value: 'country' },
  { label: 'Phone Number', value: 'phoneNumber' },
  { label: 'Company Logo', value: 'companyLogoUrl' },
  { label: 'Company Name', value: 'companyName' },
  { label: 'Company Position', value: 'companyPosition' },
  { label: 'Company Website', value: 'companyWebsite' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Presentation Topic', value: 'presentationTopic' },
  { label: 'Presentation Summary', value: 'presentationSummary' },
  { label: 'Technical Requirements', value: 'technicalRequirements' },
]

export const ParticipantRoles: CollectionConfig = {
  slug: 'participant-roles',
  admin: {
    useAsTitle: 'name',
    group: 'Event Planning',
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    read: organizationAwareRead,
    create: organizationAwareCreate,
    update: organizationAwareUpdate,
    delete: organizationAwareDelete,
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      defaultValue: defaultOrganizationValue,
      admin: {
        description: 'The organization this participant role belongs to',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
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
      options: participantFieldOptions,
      admin: {
        position: 'sidebar',
        description: 'Select which fields are required in the public registration form',
        components: {
          Field: {
            path: '@/components/fields/FilteredSelectField',
            clientProps: {
              excludeFieldPath: 'optionalFields',
              allOptions: participantFieldOptions,
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
      options: participantFieldOptions,
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
              allOptions: participantFieldOptions,
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
        description: 'Share this link with people to register as this participant role',
        components: {
          Field: {
            path: '@/components/fields/PublicFormLinkField',
            clientProps: {
              baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || '/',
            },
          },
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [autoSelectOrganization, validateParticipantFields, syncOptionalFields],
    beforeChange: [generatePublicFormLink],
    afterChange: [generatePublicFormLinkAfterCreate, revalidateCache],
    afterDelete: [revalidateCacheOnDelete],
  },
}
