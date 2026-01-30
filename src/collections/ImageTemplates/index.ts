import type { CollectionConfig } from 'payload'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'
import { autoSelectOrganization } from '@/hooks/autoSelectOrganization'
import { defaultOrganizationValue } from '@/fields/defaultOrganizationValue'
import { formatSlugHook } from '@/utils/formatSlug'

/**
 * ImageTemplates Collection
 * Stores saved canvas states from the image-generator tool
 * Used for bulk image generation for participants and partners
 */
export const ImageTemplates: CollectionConfig = {
  slug: 'image-templates',
  hooks: {
    beforeValidate: [autoSelectOrganization],
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: async ({ req: { user } }) => {
      // Super-admins and admins can create templates for any organization
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only create templates for their organizations
      return !!user
    },
    read: async ({ req: { user, payload } }) => {
      // Super-admins and admins can read all templates
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only read templates for their organizations
      if (!user) return false

      const organizationIds = await getUserOrganizationIds(payload, user)

      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        }
      }

      return false
    },
    update: async ({ req: { user, payload } }) => {
      // Super-admins and admins can update any template
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only update templates for their organizations
      if (!user) return false

      const organizationIds = await getUserOrganizationIds(payload, user)

      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        }
      }

      return false
    },
    delete: async ({ req: { user, payload } }) => {
      // Super-admins and admins can delete any template
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only delete templates for their organizations
      if (!user) return false

      const organizationIds = await getUserOrganizationIds(payload, user)

      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        }
      }

      return false
    },
  },
  admin: {
    useAsTitle: 'name',
    group: 'System',
    defaultColumns: ['name', 'organization', 'usageType', 'updatedAt'],
    description: 'Saved canvas templates from the image generator for bulk image creation',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Template name (e.g., "Business Card - Blue Theme")',
      },
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
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false, // Make optional for API usage from frontend
      defaultValue: defaultOrganizationValue,
      admin: {
        description: 'The organization this template belongs to',
      },
    },
    {
      name: 'usageType',
      type: 'select',
      required: true,
      options: [
        { label: 'Participants', value: 'participant' },
        { label: 'Partners', value: 'partner' },
        { label: 'Both', value: 'both' },
      ],
      defaultValue: 'participant',
      admin: {
        description: 'Who this template is designed for',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this template is active and can be used',
      },
    },
    {
      name: 'width',
      type: 'number',
      required: true,
      admin: {
        description: 'Canvas width in pixels',
      },
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      admin: {
        description: 'Canvas height in pixels',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image for the template',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: {
        description: 'Background color (hex code) if no background image is set',
      },
    },
    {
      name: 'elements',
      type: 'json',
      required: true,
      admin: {
        description:
          'Canvas elements array with coordinates, text properties, and image URLs. Saved from image-generator tool.',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Preview thumbnail of the template',
      },
    },
  ],
}
