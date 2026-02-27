import type { CollectionAfterChangeHook } from 'payload'
import { checkRole } from '@/access/utilities'

/**
 * Hook to automatically create a subscription when an organization is created
 * - Super-admins and admins get unlimited subscription
 * - Regular users get free tier with trial
 */
export const createSubscription: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  console.log(`🪝 createSubscription hook fired - operation: ${operation}, doc.id: ${doc.id}`)

  // Only run on organization creation
  if (operation !== 'create') {
    console.log(`⏭️  Skipping subscription creation - operation is ${operation}`)
    return doc
  }

  const { user, payload } = req

  if (!user) {
    console.error('❌ No user found when creating organization subscription')
    return doc
  }

  console.log(`💳 Creating subscription for organization ${doc.id}, user: ${user.id}`)

  try {
    // Check if user is super-admin or admin
    const isSystemAdmin = checkRole(['super-admin', 'admin'], user)

    // Calculate trial end date (14 days from now)
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)

    // Calculate current period end (30 days from now for monthly)
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + 30)

    if (isSystemAdmin) {
      // Create unlimited subscription for super-admins and admins
      await payload.create({
        collection: 'subscriptions',
        data: {
          organization: doc.id,
          tier: 'system-unlimited',
          billingCycle: 'none',
          isSystemAdmin: true,
          seatsIncluded: -1, // Unlimited
          additionalSeats: 0,
          pricePerAdditionalSeat: 0,
          stripeStatus: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: null,
        },
      })

      console.log(
        `✅ Created unlimited subscription for organization ${doc.id} (System Admin)`,
      )
    } else {
      // Create free tier subscription with trial for regular users
      await payload.create({
        collection: 'subscriptions',
        data: {
          organization: doc.id,
          tier: 'free',
          billingCycle: 'monthly',
          isSystemAdmin: false,
          seatsIncluded: 3, // Free tier: 3 seats
          additionalSeats: 0,
          pricePerAdditionalSeat: 0,
          stripeStatus: 'trialing',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          trialStart: new Date().toISOString(),
          trialEnd: trialEnd.toISOString(),
        },
      })

      console.log(`✅ Created free trial subscription for organization ${doc.id} (14 days)`)
    }
  } catch (error) {
    console.error('❌ Failed to create subscription for organization:', error)
    // Don't throw - organization creation should still succeed
  }

  return doc
}
