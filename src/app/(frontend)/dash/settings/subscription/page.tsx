import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SubscriptionForm } from './SubscriptionForm'
import SubscriptionLoading from './loading'

async function SubscriptionData() {
  // Auth is already handled in layout
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  // Get the user's organization
  const { docs: orgs } = await payload.find({
    collection: 'organizations',
    where: { owner: { equals: user?.id } },
    limit: 1,
    depth: 0,
  })

  const org = orgs[0] ?? null

  // Get subscription for the organization
  let subscription = null
  if (org) {
    const { docs: subs } = await payload.find({
      collection: 'subscriptions',
      where: { organization: { equals: org.id } },
      limit: 1,
      depth: 0,
    })
    const sub = subs[0]
    if (sub) {
      // Normalize the subscription data to ensure all fields have proper types
      // Convert null to undefined for optional fields, and set defaults for required fields
      subscription = {
        tier: sub.tier,
        billingCycle: sub.billingCycle,
        isSystemAdmin: sub.isSystemAdmin ?? false,
        seatsIncluded: sub.seatsIncluded ?? 0,
        additionalSeats: sub.additionalSeats ?? 0,
        stripeStatus: sub.stripeStatus,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: sub.currentPeriodEnd || undefined,
        lastFourDigits: sub.lastFourDigits || undefined,
        trialEnd: sub.trialEnd || undefined,
      }
    }
  }

  return (
    <SubscriptionForm
      subscription={subscription}
      organizationName={org?.name ?? undefined}
    />
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionLoading />}>
      <SubscriptionData />
    </Suspense>
  )
}
