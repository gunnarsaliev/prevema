import type { CollectionConfig } from 'payload'
import {
  teamAwareRead,
  teamAwareCreate,
  teamAwareUpdate,
  teamAwareDelete,
} from'../../access/teamAwareAccess'
import { autoSelectTeam } from '@/hooks/autoSelectTeam'
import { defaultTeamValue } from '@/fields/defaultTeamValue'
import { formatSlugHook } from '@/utils/formatSlug'

export const PartnerTiers: CollectionConfig = {
  slug: 'partner-tiers',
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
  hooks: {
    beforeValidate: [autoSelectTeam],
  },
  fields: [
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      defaultValue: defaultTeamValue,
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
