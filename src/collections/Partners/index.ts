import type { CollectionConfig } from 'payload'
import {
  organizationAwareUpdate,
  organizationAwareDelete,
} from '../../access/organizationAwareAccess'
import { publicPartnerCreate, publicPartnerRead } from '../../access/publicPartnerAccess'
import { populateOrganizationFromEvent } from './hooks/populateOrganizationFromEvent'
import { handleEmailAutomation } from './hooks/handleEmailAutomation'
import { handleSocialPostGeneration } from './hooks/handleSocialPostGeneration'
import { defaultEventValue } from '@/fields/defaultEventValue'

const setPartnerCreatedDate = ({
  value,
  originalDoc,
  operation,
}: {
  value?: string
  originalDoc?: any
  operation?: string
}) => {
  if (operation === 'create') {
    return new Date().toISOString()
  }
  return value
}

export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    useAsTitle: 'companyName',
    group: 'Event Planning',
    components: {
      beforeListTable: ['@/collections/Partners/components#BulkEmailAction'],
    },
  },
  access: {
    read: publicPartnerRead,
    create: publicPartnerCreate,
    update: organizationAwareUpdate,
    delete: organizationAwareDelete,
  },
  fields: [
    {
      name: 'generateSocialPostButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/Partners/components#GenerateSocialPostButton',
        },
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      admin: {
        description: 'The organization this partner belongs to (auto-populated from event)',
        readOnly: true,
      },
    },
    {
      name: 'companyName',
      type: 'text',
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
      name: 'partnerType',
      type: 'relationship',
      relationTo: 'partner-types',
      required: true,
      access: {
        create: () => true,
        update: () => true,
      },
    },
    {
      name: 'contactPerson',
      type: 'text',
      required: true,
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'General company email (different from contact person email)',
      },
    },
    {
      name: 'fieldOfExpertise',
      type: 'text',
      admin: {
        description: "Partner's primary field or area of expertise",
      },
    },
    {
      name: 'companyWebsiteUrl',
      type: 'text',
      admin: {
        description: 'Company website URL',
      },
    },
    {
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload company logo image',
        condition: (data: any, siblingData: any) => {
          if (!siblingData.partnerType) return false
          return true
        },
      },
    },
    {
      name: 'companyLogoUrl',
      type: 'text',
      admin: {
        description: 'Direct URL to company logo (alternative to upload)',
      },
    },
    {
      name: 'companyBanner',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Company banner or cover image',
      },
    },
    {
      name: 'companyDescription',
      type: 'textarea',
      admin: {
        description: 'Description of the company and its services',
      },
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
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Social media links for the company',
      },
    },
    {
      name: 'sponsorshipLevel',
      type: 'text',
      admin: {
        condition: (data: any, siblingData: any) => {
          if (!siblingData.partnerType) return false
          return true
        },
      },
    },
    {
      name: 'additionalNotes',
      type: 'textarea',
      admin: {
        condition: (data: any, siblingData: any) => {
          if (!siblingData.partnerType) return false
          return true
        },
      },
    },
    {
      name: 'tier',
      type: 'relationship',
      relationTo: 'partner-tiers',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Declined', value: 'declined' },
      ],
      defaultValue: 'default',
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { hidden: true },
      defaultValue: ({ user }: any) => user.id,
    },
    {
      name: 'createdDate',
      type: 'date',
      admin: { readOnly: true },
      hooks: {
        beforeChange: [setPartnerCreatedDate],
      },
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
        description:
          'AI-generated Instagram post (125-150 characters, visual storytelling with emojis)',
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
    beforeChange: [populateOrganizationFromEvent],
    afterChange: [handleEmailAutomation, handleSocialPostGeneration],
  },
}
