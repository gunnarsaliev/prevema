import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { EventsList } from './components/EventsList'

export default async function EventsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const { docs } = await payload.find({
    collection: 'events',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 200,
    sort: '-createdAt',
  })

  return (
    <div className="px-6 py-8">
      <EventsList events={docs} />
    </div>
  )
}
