import type { CollectionConfig } from 'payload'

import { organizationOwnerFieldAccess } from '@/access/organizationOwnerFieldAccess'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'
import { validateEmailConfig } from '@/services/emailValidation'
import { formatSlugHook } from '@/utils/formatSlug'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: ({ req: { user } }) => {
      // All authenticated users can create organizations
      // Organization-level limits (seats) are managed via Subscriptions collection
      return !!user
    },
    read: async ({ req: { user, payload } }) => {
      // Super-admins and admins can read all organizations
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only read organizations they are members of
      if (!user) return false

      // Get organization IDs from members collection
      const organizationIds = await getUserOrganizationIds(payload, user)

      // Fallback: Also get organizations where user is the owner
      // This ensures visibility even if members table doesn't exist yet or member records are missing
      let ownedOrganizations: (number | string)[] = []
      try {
        const orgs = await payload.find({
          collection: 'organizations',
          where: {
            owner: {
              equals: user.id,
            },
          },
          depth: 0,
          limit: 1000,
        })
        ownedOrganizations = orgs.docs.map((org) => org.id)
      } catch (error) {
        console.error('Error fetching owned organizations:', error)
      }

      // Combine organization IDs from both sources (members + owner)
      const allOrganizationIds = [...new Set([...organizationIds, ...ownedOrganizations])]

      if (allOrganizationIds.length > 0) {
        return {
          id: {
            in: allOrganizationIds,
          },
        }
      }

      // Allow authenticated users to access the collection even if they have no organizations yet
      // This enables creating their first organization
      return {
        id: {
          in: [], // Empty array - shows collection UI but no results
        },
      }
    },
    update: async ({ req: { user, payload } }) => {
      // Super-admins and admins can update any organization
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Organization owners can update their own organizations
      if (!user) return false

      const ownedOrganizationIds = await getUserOrganizationIds(payload, user, 'owner')

      if (ownedOrganizationIds.length > 0) {
        return {
          id: {
            in: ownedOrganizationIds,
          },
        }
      }

      return false
    },
    delete: async ({ req: { user, payload } }) => {
      // Super-admins and admins can delete any organization
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Organization owners can delete their own organizations
      if (!user) return false

      const ownedOrganizationIds = await getUserOrganizationIds(payload, user, 'owner')

      if (ownedOrganizationIds.length > 0) {
        return {
          id: {
            in: ownedOrganizationIds,
          },
        }
      }

      return false
    },
  },
  admin: {
    useAsTitle: 'name',
    group: 'Event Planning',
    defaultColumns: ['name', 'owner'],
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (!data) return data

        // Automatically set owner to current user on create
        if (operation === 'create' && req.user) {
          data.owner = req.user.id
        }

        // Validate email configuration if provided
        if (data.emailConfig) {
          const validation = validateEmailConfig(data.emailConfig)
          if (!validation.valid) {
            throw new Error(
              `Email configuration validation failed:\n${validation.errors.join('\n')}`,
            )
          }
        }

        return data
      },
    ],
  },
  fields: [
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }) => user?.id,
      admin: {
        description: 'The primary owner of this organization (cannot be changed)',
        readOnly: true,
      },
    },
    {
      name: 'emailConfig',
      type: 'group',
      label: 'Custom Email Configuration',
      access: {
        read: organizationOwnerFieldAccess,
        update: organizationOwnerFieldAccess,
      },
      admin: {
        description: 'Configure custom Resend settings for this organization',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable custom email configuration for this organization',
          },
        },
        {
          name: 'resendApiKey',
          type: 'text',
          admin: {
            description: 'Custom Resend API key (starts with re_). Leave empty to use default.',
            condition: (data, siblingData) => siblingData?.isActive,
            components: {
              Field: {
                path: '@/collections/Organizations/components#EncryptedField',
                clientProps: {
                  placeholder: 're_••••••••••••••',
                },
              },
            },
          },
          validate: (value: string | null | undefined): true | string => {
            if (!value || value.trim() === '') return true // Optional field

            // Validate format if provided
            if (!value.startsWith('re_')) {
              return 'API key must start with "re_"'
            }

            if (value.length < 13) {
              return 'API key is too short'
            }

            const validPattern = /^re_[a-zA-Z0-9_]+$/
            if (!validPattern.test(value)) {
              return 'API key contains invalid characters'
            }

            return true
          },
        },
        {
          name: 'senderName',
          type: 'text',
          admin: {
            description: 'From name for emails sent by this organization',
            condition: (data, siblingData) => siblingData?.isActive,
          },
        },
        {
          name: 'fromEmail',
          type: 'email',
          admin: {
            description: 'From email address for this organization',
            condition: (data, siblingData) => siblingData?.isActive,
          },
        },
        {
          name: 'replyToEmail',
          type: 'email',
          admin: {
            description: 'Reply-to email address',
            condition: (data, siblingData) => siblingData?.isActive,
          },
        },
        {
          name: 'emailConfigStatus',
          type: 'ui',
          admin: {
            components: {
              Field: '@/collections/Organizations/components#EmailConfigStatus',
            },
          },
        },
      ],
    },
  ],
}
