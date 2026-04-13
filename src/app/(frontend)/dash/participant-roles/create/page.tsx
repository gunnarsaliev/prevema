import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { TopBar } from '@/components/shared/TopBar'

import { ParticipantRoleForm } from '../components/ParticipantRoleForm'

export default async function CreateParticipantRolePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Get all organization IDs where user is a member (including as owner)
  const organizationIds = await getUserOrganizationIds(payload, user)

  const { docs: orgDocs } = await payload.find({
    collection: 'organizations',
    where: { id: { in: organizationIds } },
    depth: 0,
    limit: 100,
    select: { name: true },
  })

  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Create Participant Role"
        description="Define a new participant role and its registration form fields"
        backHref="/dash/participant-roles"
        backTitle="Back to participant roles"
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <ParticipantRoleForm mode="create" organizations={organizations} />
        </div>
      </div>
    </div>
  )
}
