import type { CollectionConfig } from 'payload'
import {
  organizationAwareRead,
  organizationAwareCreate,
  organizationAwareUpdate,
  organizationAwareDelete,
} from '../../access/organizationAwareAccess'
import { autoSelectOrganization } from '@/hooks/autoSelectOrganization'
import { defaultOrganizationValue } from '@/fields/defaultOrganizationValue'
import { formatSlugHook } from '@/utils/formatSlug'

export const PartnerTiers: CollectionConfig = {
  slug: 'partner-tiers',
  admin: {
    useAsTitle: 'name',
    group: 'Event Planning',
  },
  access: {
    read: organizationAwareRead,
    create: organizationAwareCreate,
    update: organizationAwareUpdate,
    delete: organizationAwareDelete,
  },
  hooks: {
    beforeValidate: [autoSelectOrganization],
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      defaultValue: defaultOrganizationValue,
      admin: {
        description: 'The organization this partner tier belongs to',
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
      name: 'level',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    },
    // {
    //   name: 'benefits',
    //   type: 'array',
    //   fields: [{ name: 'benefit', type: 'text', required: true }],
    // },
  ],
}
