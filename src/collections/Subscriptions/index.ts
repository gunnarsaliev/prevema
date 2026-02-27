import type { CollectionConfig } from 'payload'
import { checkRole } from '@/access/utilities'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    group: 'System',
    defaultColumns: ['organization', 'tier', 'stripeStatus', 'seatsIncluded', 'additionalSeats'],
    description: 'Manages organization subscriptions and billing',
  },
  access: {
    // Only super-admins can create subscriptions manually (usually done via hooks)
    create: ({ req: { user } }) => checkRole(['super-admin'], user),
    // Organization owners/admins can read their own subscription, super-admins can read all
    read: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins can read all subscriptions
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Get organizations where user is owner or admin
      const memberships = await payload.find({
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
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
        limit: 1000,
        depth: 0,
      })

      const orgIds = memberships.docs.map((m) =>
        typeof m.organization === 'object' ? m.organization.id : m.organization,
      )

      if (orgIds.length > 0) {
        return {
          organization: {
            in: orgIds,
          },
        }
      }

      return false
    },
    // Only super-admins can update subscriptions (for manual adjustments)
    update: ({ req: { user } }) => checkRole(['super-admin'], user),
    // Only super-admins can delete subscriptions
    delete: ({ req: { user } }) => checkRole(['super-admin'], user),
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'The organization this subscription belongs to',
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        {
          label: 'System Unlimited (Admin)',
          value: 'system-unlimited',
        },
        {
          label: 'Free',
          value: 'free',
        },
        {
          label: 'Starter',
          value: 'starter',
        },
        {
          label: 'Professional',
          value: 'professional',
        },
        {
          label: 'Enterprise',
          value: 'enterprise',
        },
      ],
      admin: {
        description: 'Subscription tier',
      },
    },
    {
      name: 'billingCycle',
      type: 'select',
      required: true,
      defaultValue: 'monthly',
      options: [
        {
          label: 'None (System Admin)',
          value: 'none',
        },
        {
          label: 'Monthly',
          value: 'monthly',
        },
        {
          label: 'Yearly',
          value: 'yearly',
        },
      ],
      admin: {
        description: 'Billing cycle for the subscription',
      },
    },
    {
      name: 'isSystemAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'True if organization owner is a super-admin/admin. Grants unlimited access without Stripe.',
        readOnly: true,
      },
    },
    {
      name: 'seatsIncluded',
      type: 'number',
      required: true,
      defaultValue: 3,
      admin: {
        description: 'Number of seats included in the base plan. Use -1 for unlimited.',
      },
    },
    {
      name: 'additionalSeats',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Additional seats purchased beyond the base plan',
      },
    },
    {
      name: 'pricePerAdditionalSeat',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Price per additional seat in cents (e.g., 500 = €5.00)',
        condition: (data) => data.tier === 'starter',
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      index: true,
      admin: {
        description: 'Stripe Customer ID (e.g., cus_xxxxx)',
        readOnly: true,
        condition: (data) => !data.isSystemAdmin,
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Stripe Subscription ID (e.g., sub_xxxxx)',
        readOnly: true,
        condition: (data) => !data.isSystemAdmin,
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        description: 'Stripe Price ID for the base plan (e.g., price_xxxxx)',
        condition: (data) => !data.isSystemAdmin,
      },
    },
    {
      name: 'stripeStatus',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Incomplete',
          value: 'incomplete',
        },
        {
          label: 'Incomplete Expired',
          value: 'incomplete_expired',
        },
        {
          label: 'Trialing',
          value: 'trialing',
        },
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Past Due',
          value: 'past_due',
        },
        {
          label: 'Canceled',
          value: 'canceled',
        },
        {
          label: 'Unpaid',
          value: 'unpaid',
        },
        {
          label: 'Paused',
          value: 'paused',
        },
      ],
      admin: {
        description: 'Subscription status synced from Stripe',
      },
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
      admin: {
        description: 'Start of the current billing period',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      admin: {
        description: 'End of the current billing period',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'trialStart',
      type: 'date',
      admin: {
        description: 'Start of trial period',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data.stripeStatus === 'trialing',
      },
    },
    {
      name: 'trialEnd',
      type: 'date',
      admin: {
        description: 'End of trial period (14 days from org creation)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data.stripeStatus === 'trialing',
      },
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'If true, subscription will be canceled at the end of the current period',
        condition: (data) => !data.isSystemAdmin,
      },
    },
    {
      name: 'canceledAt',
      type: 'date',
      admin: {
        description: 'When the subscription was canceled',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
    {
      name: 'endedAt',
      type: 'date',
      admin: {
        description: 'When the subscription ended',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
    {
      name: 'stripePaymentMethodId',
      type: 'text',
      admin: {
        description: 'Default payment method ID in Stripe (e.g., pm_xxxxx)',
        readOnly: true,
        condition: (data) => !data.isSystemAdmin,
      },
    },
    {
      name: 'lastFourDigits',
      type: 'text',
      admin: {
        description: 'Last 4 digits of payment card (for display)',
        readOnly: true,
        condition: (data) => !data.isSystemAdmin,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (synced with Stripe metadata)',
      },
    },
  ],
}
