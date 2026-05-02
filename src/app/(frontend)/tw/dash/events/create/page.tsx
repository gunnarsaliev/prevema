import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { EventForm } from './EventForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Event',
}

export default async function CreateEventPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const organizationIds = await getUserOrganizationIds(payload, user)

  const { docs: orgs } = await payload.find({
    collection: 'organizations',
    where: {
      id: {
        in: organizationIds,
      },
    },
    depth: 0,
    limit: 100,
    select: { name: true },
  })

  const organizations = orgs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="px-8 py-8">
      <EventForm organizations={organizations} />
    </div>
  )
}
