import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'

import { ParticipantRoleForm } from '../components/ParticipantRoleForm'

export default async function CreateParticipantRolePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Get all organization IDs where user is a member (including as owner)
  const organizationIds = await getUserOrganizationIds(payload, user)

  const [{ docs: eventDocs }, { docs: orgDocs }] = await Promise.all([
    payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 200,
      sort: 'name',
      select: { name: true },
    }),
    payload.find({
      collection: 'organizations',
      where: {
        id: {
          in: organizationIds,
        },
      },
      depth: 0,
      limit: 100,
      select: { name: true },
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create participant role</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define a new participant role and its registration form fields.
        </p>
      </div>
      <ParticipantRoleForm mode="create" organizations={organizations} events={events} />
    </div>
  )
}
