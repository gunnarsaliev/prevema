import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnerTypesList } from './components/PartnerTypesList'
import { EmptyEventState } from '@/components/EmptyEventState'

export default async function PartnerTypesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [{ docs: partnerTypes }, { docs: eventDocs }] = await Promise.all([
    payload.find({
      collection: 'partner-types',
      overrideAccess: false,
      user,
      depth: 1, // resolve event name
      limit: 200,
      sort: 'name',
    }),
    payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 200,
      sort: 'name',
      select: { name: true },
    }),
  ])

  // Show empty state if no events exist
  if (eventDocs.length === 0) {
    return <EmptyEventState />
  }

  return (
    <div className="px-6 py-8">
      <PartnerTypesList partnerTypes={partnerTypes} />
    </div>
  )
}
