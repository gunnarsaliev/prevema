import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnerTypeForm } from '../components/PartnerTypeForm'

export default async function CreatePartnerTypePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const [{ docs: eventDocs }, { docs: orgDocs }] = await Promise.all([
    payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 200,
      sort: 'name',
      select: { id: true, name: true },
    }),
    payload.find({
      collection: 'organizations',
      where: {
        or: [
          { owner: { equals: user.id } },
          { 'members.user': { equals: user.id } },
        ],
      },
      depth: 0,
      limit: 100,
      select: { id: true, name: true },
    }),
  ])

  const events = eventDocs.map((e) => ({ id: e.id, name: e.name }))
  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create partner type</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define a new partner type and its registration form fields.
        </p>
      </div>
      <PartnerTypeForm mode="create" organizations={organizations} events={events} />
    </div>
  )
}
