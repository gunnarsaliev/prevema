import type { CollectionConfig, Where } from 'payload'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'
import { autoSelectOrganization } from '@/hooks/autoSelectOrganization'
import { defaultOrganizationValue } from '@/fields/defaultOrganizationValue'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
  },
  hooks: {
    beforeValidate: [autoSelectOrganization],
  },
  access: {
    create: async ({ req: { user, payload } }) => {
      // Super-admins and admins can create media
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }
      // Regular users can only create media if they belong to an organization
      if (!user) return false
      const organizationIds = await getUserOrganizationIds(payload, user)
      return organizationIds.length > 0
    },
    read: async ({ req: { user, payload } }) => {
      // Super-admins and admins can read all media
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }
      // Public read access for displaying images in forms
      if (!user) return true
      // Authenticated users can read: unscoped media OR media from their organizations
      const organizationIds = await getUserOrganizationIds(payload, user)
      return {
        or: [
          { organization: { exists: false } },
          ...(organizationIds.length > 0 ? [{ organization: { in: organizationIds } }] : []),
        ],
      } as Where
    },
    update: async ({ req: { user, payload } }) => {
      // Super-admins and admins can update any media
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }
      // Regular users can only update media from their organizations
      if (!user) return false
      const organizationIds = await getUserOrganizationIds(payload, user)
      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        } as Where
      }
      return false
    },
    delete: async ({ req: { user, payload } }) => {
      // Super-admins and admins can delete any media
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }
      // Regular users can only delete media from their organizations
      if (!user) return false
      const organizationIds = await getUserOrganizationIds(payload, user)
      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        } as Where
      }
      return false
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      defaultValue: defaultOrganizationValue,
      admin: {
        description: 'The organization this media file belongs to',
        position: 'sidebar',
      },
    },
    {
      name: 'isTemplateAsset',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Auto-generated asset used internally by image templates (hidden from media library)',
        position: 'sidebar',
      },
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    // Restrict to image files only
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
}
