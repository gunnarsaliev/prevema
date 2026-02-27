import type { CollectionConfig } from 'payload'
import { checkRole } from '@/access/utilities'
import { enforceSeatLimits } from './hooks/enforceSeatLimits'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'id',
    group: 'System',
    defaultColumns: ['user', 'organization', 'role', 'status', 'createdAt'],
    description: 'Manages user memberships in organizations',
  },
  access: {
    // Super-admins and system admins can see all memberships
    read: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins and system admins can see all
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Users can see memberships where they are the user OR where they have admin+ access in the organization
      // This will be handled by a more complex query
      const orConditions: any[] = [
        // Can see their own memberships
        {
          user: {
            equals: user.id,
          },
        },
      ]

      // Find organizations where user is owner or has admin role
      const adminMemberships = await payload.find({
        collection: 'members',
        where: {
          and: [
            {
              user: {
                equals: user.id,
              },
            },
            {
              or: [
                {
                  role: {
                    equals: 'owner',
                  },
                },
                {
                  role: {
                    equals: 'admin',
                  },
                },
              ],
            },
          ],
        },
        limit: 1000,
        depth: 0,
      })

      const managedOrgIds = adminMemberships.docs.map((m) =>
        typeof m.organization === 'object' ? m.organization.id : m.organization,
      )

      if (managedOrgIds.length > 0) {
        orConditions.push({
          organization: {
            in: managedOrgIds,
          },
        })
      }

      return {
        or: orConditions,
      }
    },
    // Super-admins, system admins, and organization owners/admins can create memberships
    create: async ({ req: { user, payload }, data }) => {
      if (!user) return false

      // Super-admins and system admins can create any membership
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // If organization is provided, check if user is owner/admin of that org
      if (data?.organization) {
        const orgId =
          typeof data.organization === 'object' ? data.organization.id : data.organization

        // Check if user is owner or admin of this organization
        const membership = await payload.find({
          collection: 'members',
          where: {
            and: [
              {
                organization: {
                  equals: orgId,
                },
              },
              {
                user: {
                  equals: user.id,
                },
              },
              {
                or: [
                  {
                    role: {
                      equals: 'owner',
                    },
                  },
                  {
                    role: {
                      equals: 'admin',
                    },
                  },
                ],
              },
            ],
          },
          limit: 1,
        })

        return membership.docs.length > 0
      }

      return false
    },
    // Super-admins, system admins, and organization owners/admins can update memberships
    update: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins and system admins can update any membership
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Organization owners/admins can update memberships in their organizations
      const adminMemberships = await payload.find({
        collection: 'members',
        where: {
          and: [
            {
              user: {
                equals: user.id,
              },
            },
            {
              or: [
                {
                  role: {
                    equals: 'owner',
                  },
                },
                {
                  role: {
                    equals: 'admin',
                  },
                },
              ],
            },
          ],
        },
        limit: 1000,
        depth: 0,
      })

      const managedOrgIds = adminMemberships.docs.map((m) =>
        typeof m.organization === 'object' ? m.organization.id : m.organization,
      )

      if (managedOrgIds.length > 0) {
        return {
          organization: {
            in: managedOrgIds,
          },
        }
      }

      return false
    },
    // Super-admins, system admins, and organization owners/admins can delete memberships
    delete: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins and system admins can delete any membership
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Organization owners/admins can delete memberships in their organizations
      const adminMemberships = await payload.find({
        collection: 'members',
        where: {
          and: [
            {
              user: {
                equals: user.id,
              },
            },
            {
              or: [
                {
                  role: {
                    equals: 'owner',
                  },
                },
                {
                  role: {
                    equals: 'admin',
                  },
                },
              ],
            },
          ],
        },
        limit: 1000,
        depth: 0,
      })

      const managedOrgIds = adminMemberships.docs.map((m) =>
        typeof m.organization === 'object' ? m.organization.id : m.organization,
      )

      if (managedOrgIds.length > 0) {
        return {
          organization: {
            in: managedOrgIds,
          },
        }
      }

      return false
    },
  },
  hooks: {
    beforeValidate: [
      // Check seat limits before adding new members
      enforceSeatLimits,
      // Set defaults and handle owner role
      async ({ data, req, operation }) => {
        if (!data) return data

        // Automatically set the owner for the organization's first member (during org creation)
        if (operation === 'create' && data?.isOwner) {
          data.role = 'owner'
          data.status = 'active'
        }

        // Set default status for new memberships
        if (operation === 'create' && !data?.status) {
          data.status = 'active'
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Only run validations for update operations
        if (operation === 'update' && originalDoc) {
          // Prevent changing the owner's membership to a different role
          if (originalDoc.role === 'owner') {
            if (data && data.role && data.role !== 'owner') {
              throw new Error('Cannot change the owner role. Transfer ownership first.')
            }
          }

          const orgId =
            typeof originalDoc.organization === 'object'
              ? originalDoc.organization.id
              : originalDoc.organization

          // If trying to change the owner role
          if (originalDoc.role === 'owner' && data?.role !== 'owner') {
            // Check if there are other owners
            const ownerCount = await req.payload.count({
              collection: 'members',
              where: {
                and: [
                  {
                    organization: {
                      equals: orgId,
                    },
                  },
                  {
                    role: {
                      equals: 'owner',
                    },
                  },
                  {
                    id: {
                      not_equals: originalDoc.id,
                    },
                  },
                ],
              },
            })

            if (ownerCount.totalDocs === 0) {
              throw new Error(
                'Cannot change the last owner. Assign another owner first.',
              )
            }
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Skip validation if we're deleting the entire organization
        if (req.context?.deletingOrganization === true) {
          console.log(`⏭️  Skipping "last owner" check - organization being deleted`)
          return
        }

        // Find the membership being deleted
        const membership = await req.payload.findByID({
          collection: 'members',
          id,
          depth: 0,
        })

        // If deleting an owner, ensure there's at least one other owner
        if (membership.role === 'owner') {
          const orgId =
            typeof membership.organization === 'object'
              ? membership.organization.id
              : membership.organization

          const ownerCount = await req.payload.count({
            collection: 'members',
            where: {
              and: [
                {
                  organization: {
                    equals: orgId,
                  },
                },
                {
                  role: {
                    equals: 'owner',
                  },
                },
                {
                  id: {
                    not_equals: id,
                  },
                },
              ],
            },
          })

          if (ownerCount.totalDocs === 0) {
            throw new Error(
              'Cannot delete the last owner. Assign another owner first.',
            )
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'The user who is a member of the organization',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      index: true,
      admin: {
        description: 'The organization this membership belongs to',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'viewer',
      options: [
        {
          label: 'Owner',
          value: 'owner',
        },
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
        description: 'The role this user has in the organization',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Removed',
          value: 'removed',
        },
      ],
      admin: {
        description: 'The status of this membership',
      },
    },
  ],
}
