import type { CollectionConfig } from 'payload'

import { teamOwnerFieldAccess } from '@/access/teamOwnerFieldAccess'
import { checkRole, canCreateTeams, getUserTeamIds, getTeamLimit } from '@/access/utilities'
import { validateEmailConfig } from '@/services/emailValidation'
import { formatSlugHook } from '@/utils/formatSlug'
import { autoInviteMembers } from './hooks/autoInviteMembers'

export const Teams: CollectionConfig = {
  slug: 'teams',
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: async ({ req: { user, payload } }) => {
      // Super-admins and admins can always create teams (no limit)
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Check if user's pricing plan allows team creation
      if (!canCreateTeams(user)) {
        return false
      }

      // Check if user has reached their plan's team limit
      if (user) {
        const teamLimit = getTeamLimit(user)

        // null means unlimited
        if (teamLimit !== null) {
          const teamCount = await payload.count({
            collection: 'teams',
            where: {
              owner: {
                equals: user.id,
              },
            },
          })

          // Check if user has reached their limit
          if (teamCount.totalDocs >= teamLimit) {
            return false
          }
        }
      }

      return true
    },
    read: async ({ req: { user, payload } }) => {
      // Super-admins and admins can read all teams
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only read teams they are members of
      if (!user) return false

      const teamIds = await getUserTeamIds(payload, user)

      if (teamIds.length > 0) {
        return {
          id: {
            in: teamIds,
          },
        }
      }

      // Allow users who can create teams to access the collection
      // even if they have no teams yet (enables creating first team)
      if (canCreateTeams(user)) {
        return {
          id: {
            in: [], // Empty array - shows collection UI but no results
          },
        }
      }

      return false
    },
    update: async ({ req: { user, payload } }) => {
      // Super-admins and admins can update any team
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Team owners can update their own teams
      if (!user) return false

      const ownedTeamIds = await getUserTeamIds(payload, user, 'owner')

      if (ownedTeamIds.length > 0) {
        return {
          id: {
            in: ownedTeamIds,
          },
        }
      }

      return false
    },
    delete: async ({ req: { user, payload } }) => {
      // Super-admins and admins can delete any team
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Team owners can delete their own teams
      if (!user) return false

      const ownedTeamIds = await getUserTeamIds(payload, user, 'owner')

      if (ownedTeamIds.length > 0) {
        return {
          id: {
            in: ownedTeamIds,
          },
        }
      }

      return false
    },
  },
  admin: {
    useAsTitle: 'name',
    group: 'Event Planning',
    defaultColumns: ['name', 'owner', 'members'],
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
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
    afterChange: [autoInviteMembers],
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
        description: 'The primary owner of this team (cannot be changed)',
        readOnly: true,
      },
    },
    {
      name: 'members',
      type: 'array',
      access: {
        update: teamOwnerFieldAccess,
      },
      admin: {
        description: 'Additional users who have access to this team',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          filterOptions: ({ data, siblingData }) => {
            // Exclude the owner from being selectable as a member
            const ownerId = typeof data?.owner === 'object' ? data?.owner?.id : data?.owner

            // Get the current member's user ID (the one being edited)
            const currentMember = siblingData as any
            const currentUserId =
              typeof currentMember?.user === 'object'
                ? currentMember?.user?.id
                : currentMember?.user

            // Get all currently selected member user IDs
            const selectedUserIds: (string | number)[] = []

            if (data?.members && Array.isArray(data.members)) {
              data.members.forEach((member: any) => {
                const userId = typeof member?.user === 'object' ? member?.user?.id : member?.user

                // Skip the current row being edited
                if (userId && userId !== currentUserId) {
                  selectedUserIds.push(userId)
                }
              })
            }

            const filters: any = {}

            // Exclude owner if present
            if (ownerId) {
              filters.id = { not_equals: ownerId }
            }

            // Exclude already selected members if present
            if (selectedUserIds.length > 0) {
              // If we already have a not_equals filter for owner, we need to combine with AND
              if (filters.id) {
                return {
                  and: [{ id: { not_equals: ownerId } }, { id: { not_in: selectedUserIds } }],
                }
              }

              filters.id = { not_in: selectedUserIds }
            }

            return filters
          },
          admin: {
            description: 'Select an existing user',
            condition: (data, siblingData) => {
              // Hide user field if email is provided
              return !siblingData?.email
            },
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Or invite a new user by email',
            condition: (data, siblingData) => {
              // Hide email field if user is selected
              return !siblingData?.user
            },
          },
          validate: (value, { siblingData }) => {
            // Either user or email must be provided, but not both
            const hasUser = siblingData?.user
            const hasEmail = value && value.trim() !== ''

            if (!hasUser && !hasEmail) {
              return 'Please select a user or enter an email address'
            }

            if (hasUser && hasEmail) {
              return 'Please select a user OR enter an email, not both'
            }

            return true
          },
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'editor',
          options: [
            {
              label: 'Admin',
              value: 'admin',
            },
            {
              label: 'Editor',
              value: 'editor',
            },
            {
              label: 'Viewer',
              value: 'viewer',
            },
          ],
          admin: {
            description: 'Role within this team',
          },
        },
      ],
    },
    {
      name: 'emailConfig',
      type: 'group',
      label: 'Custom Email Configuration',
      access: {
        read: teamOwnerFieldAccess,
        update: teamOwnerFieldAccess,
      },
      admin: {
        description: 'Configure custom Resend settings for this team',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable custom email configuration for this team',
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
                path: '@/collections/Teams/components#EncryptedField',
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
            description: 'From name for emails sent by this team',
            condition: (data, siblingData) => siblingData?.isActive,
          },
        },
        {
          name: 'fromEmail',
          type: 'email',
          admin: {
            description: 'From email address for this team',
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
              Field: '@/collections/Teams/components#EmailConfigStatus',
            },
          },
        },
      ],
    },
  ],
}
