'use client'

import { Check, CreditCard, Users, Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SubscriptionFormProps {
  subscription: {
    tier: 'system-unlimited' | 'free' | 'starter' | 'professional' | 'enterprise'
    billingCycle: 'none' | 'monthly' | 'yearly'
    isSystemAdmin: boolean
    seatsIncluded: number
    additionalSeats: number
    stripeStatus:
      | 'incomplete'
      | 'incomplete_expired'
      | 'trialing'
      | 'active'
      | 'past_due'
      | 'canceled'
      | 'unpaid'
      | 'paused'
    currentPeriodEnd?: string
    lastFourDigits?: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
  } | null
  organizationName?: string
}

const tierInfo = {
  'system-unlimited': {
    name: 'System Unlimited',
    description: 'Unlimited access for administrators',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  },
  free: {
    name: 'Free',
    description: 'Basic features for small teams',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
  starter: {
    name: 'Starter',
    description: 'Essential features for growing teams',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  },
  professional: {
    name: 'Professional',
    description: 'Advanced features for professional teams',
    color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full features for large organizations',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  },
}

const statusInfo = {
  incomplete: {
    label: 'Incomplete',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
  incomplete_expired: {
    label: 'Incomplete Expired',
    color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  },
  trialing: {
    label: 'Trial',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  },
  past_due: {
    label: 'Past Due',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  },
  canceled: {
    label: 'Canceled',
    color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  },
  paused: {
    label: 'Paused',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
}

export function SubscriptionForm({ subscription, organizationName }: SubscriptionFormProps) {
  if (!subscription) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 size-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Subscription Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {organizationName
              ? `No subscription found for ${organizationName}`
              : 'Create an organization to view subscription details'}
          </p>
        </div>
      </div>
    )
  }

  const tier = tierInfo[subscription.tier]
  const status = statusInfo[subscription.stripeStatus]
  const totalSeats = subscription.seatsIncluded + subscription.additionalSeats
  const isUnlimited = subscription.seatsIncluded === -1

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="p-6">
        <h2 className="text-lg font-semibold">Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing</p>

        <div className="mt-6 space-y-6">
          {/* Current Plan */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium">Current Plan</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className={cn('text-sm font-medium', tier.color)}>{tier.name}</Badge>
                  <Badge className={cn('text-sm font-medium', status.color)}>{status.label}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>
            </div>

            {subscription.isSystemAdmin && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
                <div className="flex items-start gap-3">
                  <Check className="size-5 shrink-0 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Administrator Access
                    </p>
                    <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
                      You have unlimited access as a system administrator
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subscription.stripeStatus === 'trialing' && subscription.trialEnd && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <Calendar className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Trial Period
                    </p>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                      Your trial ends on {formatDate(subscription.trialEnd)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Subscription Ending
                    </p>
                    <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                      Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Billing Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Billing Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Billing Cycle</p>
                <p className="text-sm font-medium capitalize">
                  {subscription.billingCycle === 'none' ? 'N/A' : subscription.billingCycle}
                </p>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Next Billing Date</p>
                  <p className="text-sm font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              )}
            </div>

            {!subscription.isSystemAdmin && subscription.lastFourDigits && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <CreditCard className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium">•••• •••• •••• {subscription.lastFourDigits}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Seats Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Team Seats</h3>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
              <Users className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Available Seats</p>
                <p className="text-sm font-medium">
                  {isUnlimited ? (
                    'Unlimited'
                  ) : (
                    <>
                      {totalSeats} seat{totalSeats !== 1 ? 's' : ''}
                      {subscription.additionalSeats > 0 && (
                        <span className="text-muted-foreground">
                          {' '}
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
        </div>
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
        {!subscription.isSystemAdmin && (
          <>
            <Button variant="outline">Manage Payment Method</Button>
            <Button>Upgrade Plan</Button>
          </>
        )}
      </div>
    </div>
  )
}
