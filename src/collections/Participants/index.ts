import type { CollectionConfig } from 'payload'
import { teamAwareUpdate, teamAwareDelete } from '../../access/organizationAwareAccess'
import {
  publicParticipantCreate,
  publicParticipantRead,
} from '../../access/publicParticipantAccess'
import { populateTeamFromEvent } from './hooks/populateTeamFromEvent'
import { setDefaultStatus } from './hooks/setDefaultStatus'
import { handleEmailAutomation } from './hooks/handleEmailAutomation'
import { handleSocialPostGeneration } from './hooks/handleSocialPostGeneration'
import { defaultEventValue } from '@/fields/defaultEventValue'

export const Participants: CollectionConfig = {
  slug: 'participants',
  admin: {
    useAsTitle: 'name',
    group: 'Event Planning',
    components: {
      beforeListTable: [
        '@/collections/Participants/components#BulkEmailAction',
        '@/collections/Participants/components#BulkGenerateAction',
      ],
    },
  },
  access: {
    read: publicParticipantRead,
    create: publicParticipantCreate,
    update: teamAwareUpdate,
    delete: teamAwareDelete,
  },
  fields: [
    {
      name: 'generateImageButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/Participants/components#GenerateImageButton',
        },
      },
    },
    {
      name: 'generateSocialPostButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/Participants/components#GenerateSocialPostButton',
        },
      },
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      admin: {
        description: 'The organization this participant belongs to (auto-populated from event)',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      defaultValue: defaultEventValue,
      access: {
        create: () => true,
        update: () => true,
      },
    },
    {
      name: 'participantType',
      type: 'relationship',
      relationTo: 'participant-types',
      required: true,
      access: {
        create: () => true,
        update: () => true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Not Approved', value: 'not-approved' },
        { label: 'Approved', value: 'approved' },
        { label: 'Need More Information', value: 'need-info' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'not-approved',
    },
    {
      name: 'imageUrl',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile photo or headshot',
      },
    },
    {
      name: 'biography',
      type: 'textarea',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'phoneNumber',
      type: 'text',
    },
    {
      name: 'companyLogoUrl',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Company logo',
      },
    },
    {
      name: 'companyName',
      type: 'text',
    },
    {
      name: 'companyPosition',
      type: 'text',
      admin: {
        description: 'Job title or position',
      },
    },
    {
      name: 'companyWebsite',
      type: 'text',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to participant)',
      },
    },
    {
      name: 'presentationTopic',
      type: 'text',
    },
    {
      name: 'presentationSummary',
      type: 'textarea',
    },
    {
      name: 'technicalRequirements',
      type: 'textarea',
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { hidden: true },
      defaultValue: ({ user }: any) => user?.id,
    },
    {
      name: 'registrationDate',
      type: 'date',
      admin: { readOnly: true },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'socialPostLinkedIn',
      type: 'textarea',
      admin: {
        description: 'AI-generated LinkedIn post (150-300 characters, professional tone)',
        readOnly: false,
      },
    },
    {
      name: 'socialPostTwitter',
      type: 'textarea',
      admin: {
        description: 'AI-generated Twitter/X post (max 280 characters, punchy and concise)',
        readOnly: false,
      },
    },
    {
      name: 'socialPostFacebook',
      type: 'textarea',
      admin: {
        description: 'AI-generated Facebook post (~250 characters, community-focused)',
        readOnly: false,
      },
    },
    {
      name: 'socialPostInstagram',
      type: 'textarea',
      admin: {
        description: 'AI-generated Instagram post (125-150 characters, visual storytelling with emojis)',
        readOnly: false,
      },
    },
    {
      name: 'socialPostGeneratedAt',
      type: 'date',
      admin: {
        description: 'When the social posts were last generated',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [setDefaultStatus, populateTeamFromEvent],
    afterChange: [handleEmailAutomation, handleSocialPostGeneration],
  },
}
