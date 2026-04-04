import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { TopBar } from '@/components/shared/TopBar'

import { PartnerTypeForm } from '../components/PartnerTypeForm'

export default async function CreatePartnerTypePage() {
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
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Create Partner Type"
        description="Define a new partner type and its registration form fields"
        backHref="/dash/partner-types"
        backTitle="Back to partner types"
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <PartnerTypeForm mode="create" organizations={organizations} events={events} />
        </div>
      </div>
    </div>
  )
}
