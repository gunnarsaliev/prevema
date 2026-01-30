import type { CollectionConfig } from 'payload'
import {
  teamAwareRead,
  teamAwareCreate,
  teamAwareUpdate,
  teamAwareDelete,
} from '../../access/teamAwareAccess'
import { populateCreatedBy } from './hooks/populateCreatedBy'
import { autoSelectTeam } from '@/hooks/autoSelectTeam'
import { defaultTeamValue } from '@/fields/defaultTeamValue'
import { formatSlugHook } from '@/utils/formatSlug'

export const Events: CollectionConfig = {
  slug: 'events',
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
    beforeChange: [populateCreatedBy],
  },
  fields: [
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      defaultValue: defaultTeamValue,
      admin: {
        description: 'The team this event belongs to',
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
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['planning', 'open', 'closed', 'archived'],
      defaultValue: 'planning',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      validate: (value, { data }) => {
        if (value && (data as any).startDate) {
          const endDate = new Date(value)
          const startDate = new Date((data as any).startDate)
          if (endDate < startDate) {
            return 'End date cannot be earlier than start date'
          }
        }
        return true
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'timezone',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image for the event.',
        position: 'sidebar',
      },
    },
    {
      name: 'eventType',
      type: 'select',
      options: ['physical', 'online'],
      defaultValue: 'online',
    },
    {
      name: 'address',
      type: 'text',
      admin: {
        condition: (data: any) => data.eventType === 'physical',
      },
    },
    {
      name: 'why',
      type: 'textarea',
      admin: {
        description: 'Why this event is happening - its purpose and significance',
      },
    },
    {
      name: 'what',
      type: 'textarea',
      admin: {
        description: 'What the event is about - main topics, activities, agenda',
      },
    },
    {
      name: 'where',
      type: 'text',
      admin: {
        description: 'Where context - venue name, city, or online platform',
      },
    },
    {
      name: 'who',
      type: 'textarea',
      admin: {
        description: 'Who should attend - target audience, ideal participants',
      },
    },
    {
      name: 'theme',
      type: 'text',
      admin: {
        description: 'Event theme or tagline',
      },
    },
  ],
}
