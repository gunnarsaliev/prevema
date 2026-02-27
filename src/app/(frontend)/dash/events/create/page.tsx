import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'

import { EventForm } from '../components/EventForm'

export default async function CreateEventPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Get all organization IDs where user is a member (including as owner)
  const organizationIds = await getUserOrganizationIds(payload, user)

  // Fetch the organizations
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
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create event</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details to create a new event.
        </p>
      </div>
      <EventForm mode="create" organizations={organizations} />
    </div>
  )
}
