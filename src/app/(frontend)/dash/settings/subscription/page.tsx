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
    subscription = subs[0] ?? null
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
