import type { CollectionConfig } from 'payload'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'
import { autoSelectOrganization } from '@/hooks/autoSelectOrganization'
import { defaultOrganizationValue } from '@/fields/defaultOrganizationValue'

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

      // Regular users can read public templates + their organization's private templates
      if (!user) return false

      const organizationIds = await getUserOrganizationIds(payload, user)

      return {
        or: [
          // Public templates (accessible to all authenticated users)
          { isPublic: { equals: true } } as any,
          // Private templates from user's organizations
          {
            and: [
              {
                or: [
                  { isPublic: { equals: false } } as any,
                  { isPublic: { exists: false } } as any,
                ],
              } as any,
              { organization: { in: organizationIds } } as any,
            ],
          } as any,
        ],
      } as any
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
    defaultColumns: ['name', 'organization', 'isPublic', 'isPremium', 'updatedAt'],
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
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false, // Optional for public templates
      defaultValue: defaultOrganizationValue,
      admin: {
        description: 'The organization this template belongs to (leave empty for public templates)',
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
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Public templates are available to all users across all organizations',
      },
    },
    {
      name: 'isPremium',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Premium templates require a premium subscription to use',
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
        description: 'Background color (hex code or CSS gradient) if no background image is set',
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
