import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOnlyPricingPlanAccess } from '@/access/adminOnlyPricingPlanAccess'
import { publicAccess } from '@/access/publicAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { assignUnlimitedToAdmins } from './hooks/assignUnlimitedToAdmins'
import { autoAcceptInvitation } from './hooks/autoAcceptInvitation'

export const Users: CollectionConfig = {
  slug: 'users',
  hooks: {
    afterChange: [autoAcceptInvitation],
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'System',
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'email',
    hidden: ({ user }) => {
      // Hide from regular users (only super-admins and admins can see)
      return !checkRole(['super-admin', 'admin'], user)
    },
  },
  auth: {
    tokenExpiration: 1209600,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['user'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'pricingPlan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      access: {
        create: adminOnlyPricingPlanAccess,
        update: adminOnlyPricingPlanAccess,
      },
      hooks: {
        beforeChange: [assignUnlimitedToAdmins],
      },
      options: [
        {
          label: 'Free',
          value: 'free',
        },
        {
          label: 'Pro',
          value: 'pro',
        },
        {
          label: 'Teams',
          value: 'teams',
        },
        {
          label: 'Unlimited',
          value: 'unlimited',
        },
      ],
      admin: {
        description: 'Free: 1 tenant. Pro: 3 tenants. Teams: 20 tenants.',
        condition: (data) => {
          // Hide pricing plan selector for super-admins and admins
          const roles = data?.roles || []
          const isAdminRole = roles.includes('super-admin') || roles.includes('admin')
          return !isAdminRole
        },
      },
    },
  ],
}
