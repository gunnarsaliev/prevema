'use client'

import {
  CreditCardIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'

type BadgeColor = React.ComponentProps<typeof Badge>['color']

type Tier = 'system-unlimited' | 'free' | 'starter' | 'professional' | 'enterprise'
type StripeStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'

const TIER_INFO: Record<Tier, { name: string; description: string; color: BadgeColor }> = {
  'system-unlimited': {
    name: 'System Unlimited',
    description: 'Unlimited access for system administrators',
    color: 'purple',
  },
  free: { name: 'Free', description: 'Basic features for small teams', color: 'zinc' },
  starter: {
    name: 'Starter',
    description: 'Essential features for growing teams',
    color: 'blue',
  },
  professional: {
    name: 'Professional',
    description: 'Advanced features for professional teams',
    color: 'green',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full features for large organizations',
    color: 'orange',
  },
}

const STATUS_INFO: Record<StripeStatus, { label: string; color: BadgeColor }> = {
  active: { label: 'Active', color: 'green' },
  trialing: { label: 'Trial', color: 'blue' },
  past_due: { label: 'Past Due', color: 'amber' },
  unpaid: { label: 'Unpaid', color: 'red' },
  canceled: { label: 'Canceled', color: 'red' },
  incomplete_expired: { label: 'Expired', color: 'red' },
  incomplete: { label: 'Incomplete', color: 'zinc' },
  paused: { label: 'Paused', color: 'zinc' },
}

interface BillingViewProps {
  subscription: {
    tier: Tier
    billingCycle: 'none' | 'monthly' | 'yearly'
    isSystemAdmin: boolean
    seatsIncluded: number
    additionalSeats: number
    stripeStatus: StripeStatus
    currentPeriodEnd?: string
    lastFourDigits?: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
  } | null
  organizationName?: string
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BillingView({ subscription, organizationName }: BillingViewProps) {
  if (!subscription) {
    return (
      <div className="mx-auto max-w-4xl">
        <Heading>Billing</Heading>
        <Divider className="my-10 mt-6" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <InformationCircleIcon className="mb-4 size-12 text-zinc-400 dark:text-zinc-500" />
          <Subheading>No subscription found</Subheading>
          <Text className="mt-2">
            {organizationName
              ? `No subscription found for ${organizationName}.`
              : 'Create an organization to view billing details.'}
          </Text>
        </div>
      </div>
    )
  }

  const tier = TIER_INFO[subscription.tier]
  const status = STATUS_INFO[subscription.stripeStatus]
  const totalSeats = subscription.seatsIncluded + subscription.additionalSeats
  const isUnlimited = subscription.seatsIncluded === -1

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Billing</Heading>
      <Divider className="my-10 mt-6" />

      {/* Current Plan */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Current Plan</Subheading>
          <Text>Your active subscription tier and status.</Text>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={tier.color}>{tier.name}</Badge>
            <Badge color={status.color}>{status.label}</Badge>
          </div>
          <Text>{tier.description}</Text>

          {subscription.isSystemAdmin && (
            <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-500/5 px-4 py-3 dark:border-purple-800">
              <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Administrator Access
                </p>
                <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">
                  Unlimited access granted as a system administrator.
                </p>
              </div>
            </div>
          )}

          {subscription.stripeStatus === 'trialing' && subscription.trialEnd && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-500/5 px-4 py-3 dark:border-blue-800">
              <CalendarDaysIcon className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Trial Period</p>
                <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                  Your trial ends on {formatDate(subscription.trialEnd)}.
                </p>
              </div>
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-400/5 px-4 py-3 dark:border-amber-800">
              <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Subscription Ending
                </p>
                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                </p>
              </div>
            </div>
          )}

          {(subscription.stripeStatus === 'past_due' || subscription.stripeStatus === 'unpaid') && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-500/5 px-4 py-3 dark:border-red-800">
              <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Payment Required
                </p>
                <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                  Please update your payment method to keep your subscription active.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Billing Information */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Billing Information</Subheading>
          <Text>Cycle, renewal date and payment method.</Text>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Billing Cycle
              </Text>
              <p className="mt-1 text-sm font-medium text-zinc-950 dark:text-white capitalize">
                {subscription.billingCycle === 'none' ? 'N/A' : subscription.billingCycle}
              </p>
            </div>
            {subscription.currentPeriodEnd && (
              <div>
                <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Next Billing Date
                </Text>
                <p className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            )}
          </div>

          {!subscription.isSystemAdmin && subscription.lastFourDigits && (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-950/10 bg-zinc-950/[2.5%] px-4 py-3 dark:border-white/10 dark:bg-white/[2.5%]">
              <CreditCardIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
              <div>
                <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Payment Method
                </Text>
                <p className="mt-0.5 text-sm font-medium text-zinc-950 dark:text-white">
                  •••• •••• •••• {subscription.lastFourDigits}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Team Seats */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Team Seats</Subheading>
          <Text>Total seats available for your organization.</Text>
        </div>
        <div>
          <div className="flex items-center gap-3 rounded-lg border border-zinc-950/10 bg-zinc-950/[2.5%] px-4 py-3 dark:border-white/10 dark:bg-white/[2.5%]">
            <UserGroupIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Available Seats
              </Text>
              <p className="mt-0.5 text-sm font-medium text-zinc-950 dark:text-white">
                {isUnlimited ? (
                  'Unlimited'
                ) : (
                  <>
                    {totalSeats} seat{totalSeats !== 1 ? 's' : ''}
                    {subscription.additionalSeats > 0 && (
                      <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                        ({subscription.seatsIncluded} base + {subscription.additionalSeats}{' '}
                        additional)
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!subscription.isSystemAdmin && (
        <>
          <Divider className="my-10" soft />
          <div className="flex justify-end gap-4">
            <Button outline>Manage Payment Method</Button>
            <Button>Upgrade Plan</Button>
          </div>
        </>
      )}
    </div>
  )
}
