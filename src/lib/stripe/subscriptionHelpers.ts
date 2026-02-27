import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { checkRole } from '@/access/utilities'

interface SubscriptionInfo {
  tier: 'system-unlimited' | 'free' | 'starter' | 'professional' | 'enterprise'
  billingCycle: 'none' | 'monthly' | 'yearly'
  isSystemAdmin: boolean
  seatsIncluded: number
  additionalSeats: number
  totalSeats: number
  usedSeats: number
  availableSeats: number
  isUnlimited: boolean
  stripeStatus: string
  trialEnd?: string | null
}

/**
 * Get subscription information for an organization
 * @param payload - Payload instance
 * @param organizationId - The organization ID
 * @returns Subscription information or null if not found
 */
export const getSubscription = async (
  payload: Payload,
  organizationId: number | string,
): Promise<SubscriptionInfo | null> => {
  try {
    const subscriptions = await payload.find({
      collection: 'subscriptions',
      where: {
        organization: {
          equals: organizationId,
        },
      },
      limit: 1,
    })

    if (subscriptions.docs.length === 0) {
      return null
    }

    const sub = subscriptions.docs[0]

    // Count active members in the organization
    const memberCount = await payload.count({
      collection: 'members',
      where: {
        and: [
          {
            organization: {
              equals: organizationId,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
    })

    const seatsIncluded = sub.seatsIncluded || 0
    const additionalSeats = sub.additionalSeats || 0
    const isUnlimited = sub.isSystemAdmin || seatsIncluded === -1
    const totalSeats = isUnlimited ? -1 : seatsIncluded + additionalSeats
    const usedSeats = memberCount.totalDocs
    const availableSeats = isUnlimited ? -1 : Math.max(0, totalSeats - usedSeats)

    return {
      tier: sub.tier,
      billingCycle: sub.billingCycle,
      isSystemAdmin: sub.isSystemAdmin || false,
      seatsIncluded,
      additionalSeats,
      totalSeats,
      usedSeats,
      availableSeats,
      isUnlimited,
      stripeStatus: sub.stripeStatus,
      trialEnd: sub.trialEnd,
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

/**
 * Check if an organization has available seats
 * @param payload - Payload instance
 * @param organizationId - The organization ID
 * @returns True if seats are available or subscription is unlimited
 */
export const hasAvailableSeats = async (
  payload: Payload,
  organizationId: number | string,
): Promise<boolean> => {
  const subscription = await getSubscription(payload, organizationId)

  if (!subscription) {
    return false
  }

  // Unlimited subscriptions always have available seats
  if (subscription.isUnlimited) {
    return true
  }

  // Check if there are available seats
  return subscription.availableSeats > 0
}

/**
 * Check if a subscription is unlimited (system admin or unlimited plan)
 * @param subscription - Subscription info
 * @returns True if unlimited
 */
export const isUnlimitedSubscription = (subscription: SubscriptionInfo): boolean => {
  return subscription.isSystemAdmin || subscription.seatsIncluded === -1
}

/**
 * Check if a user can bypass subscription limits (super-admin or admin role)
 * @param user - User object
 * @returns True if user can bypass limits
 */
export const canBypassLimits = (user?: User | null): boolean => {
  return checkRole(['super-admin', 'admin'], user)
}

/**
 * Get seat usage summary for display
 * @param payload - Payload instance
 * @param organizationId - The organization ID
 * @returns Formatted seat usage string
 */
export const getSeatUsageSummary = async (
  payload: Payload,
  organizationId: number | string,
): Promise<string> => {
  const subscription = await getSubscription(payload, organizationId)

  if (!subscription) {
    return 'No subscription found'
  }

  if (subscription.isSystemAdmin) {
    return 'System Administrator - Unlimited'
  }

  if (subscription.isUnlimited) {
    return `${subscription.usedSeats} seats (Unlimited)`
  }

  return `${subscription.usedSeats} of ${subscription.totalSeats} seats used`
}

/**
 * Check if a member can be added to an organization
 * @param payload - Payload instance
 * @param organizationId - The organization ID
 * @param bypassUser - User attempting the action (can bypass if super-admin/admin)
 * @returns Object with canAdd boolean and reason if false
 */
export const canAddMember = async (
  payload: Payload,
  organizationId: number | string,
  bypassUser?: User | null,
): Promise<{ canAdd: boolean; reason?: string }> => {
  // Super-admins and admins can always add members
  if (canBypassLimits(bypassUser)) {
    return { canAdd: true }
  }

  const subscription = await getSubscription(payload, organizationId)

  if (!subscription) {
    return { canAdd: false, reason: 'No subscription found for this organization' }
  }

  // Unlimited subscriptions can always add members
  if (subscription.isUnlimited) {
    return { canAdd: true }
  }

  // Check subscription status
  if (subscription.stripeStatus === 'canceled' || subscription.stripeStatus === 'unpaid') {
    return {
      canAdd: false,
      reason: `Subscription is ${subscription.stripeStatus}. Please update your billing information.`,
    }
  }

  // Check if seats are available
  if (subscription.availableSeats <= 0) {
    return {
      canAdd: false,
      reason: `No available seats. You are using ${subscription.usedSeats} of ${subscription.totalSeats} seats. Please upgrade your plan to add more members.`,
    }
  }

  return { canAdd: true }
}

/**
 * Calculate total subscription cost in cents
 * @param tier - Subscription tier
 * @param billingCycle - Billing cycle
 * @param additionalSeats - Number of additional seats
 * @returns Total cost in cents
 */
export const calculateSubscriptionCost = (
  tier: 'system-unlimited' | 'free' | 'starter' | 'professional' | 'enterprise',
  billingCycle: 'none' | 'monthly' | 'yearly',
  additionalSeats: number = 0,
): number => {
  // System admin and free plans are €0
  if (tier === 'system-unlimited' || tier === 'free') {
    return 0
  }

  // Base costs in cents
  const costs = {
    starter: {
      monthly: 2900, // €29.00 (includes 3 seats)
      yearly: 0, // Not offered
      perSeat: 500, // €5.00 per additional seat
    },
    professional: {
      monthly: 9900, // €99.00
      yearly: 7900, // €79.00 (discounted yearly)
      perSeat: 0, // Unlimited seats
    },
    enterprise: {
      monthly: 0, // Custom pricing
      yearly: 0, // Custom pricing
      perSeat: 0, // Custom
    },
  }

  if (tier === 'enterprise') {
    return 0 // Custom pricing, handle separately
  }

  const baseCost = billingCycle === 'yearly' ? costs[tier].yearly : costs[tier].monthly
  const additionalCost = additionalSeats * costs[tier].perSeat

  return baseCost + additionalCost
}
