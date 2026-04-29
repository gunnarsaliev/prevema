import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { BillingView } from './BillingView'

export const metadata: Metadata = {
  title: 'Billing',
}

export default async function BillingPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { docs: orgs } = await payload.find({
    collection: 'organizations',
    where: { owner: { equals: user?.id } },
    limit: 1,
    depth: 0,
  })

  const org = orgs[0] ?? null

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
      subscription = {
        tier: sub.tier,
        billingCycle: sub.billingCycle,
        isSystemAdmin: sub.isSystemAdmin ?? false,
        seatsIncluded: sub.seatsIncluded ?? 0,
        additionalSeats: sub.additionalSeats ?? 0,
        stripeStatus: sub.stripeStatus,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: sub.currentPeriodEnd ?? undefined,
        lastFourDigits: sub.lastFourDigits ?? undefined,
        trialEnd: sub.trialEnd ?? undefined,
      }
    }
  }

  return (
    <BillingView
      subscription={subscription}
      organizationName={org?.name ?? undefined}
    />
  )
}
