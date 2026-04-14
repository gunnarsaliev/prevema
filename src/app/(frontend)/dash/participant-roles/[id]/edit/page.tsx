import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'

import { ParticipantRoleForm } from '../../components/ParticipantRoleForm'
import type { ParticipantRoleFormValues } from '@/lib/schemas/participant-role'

export default async function EditParticipantRolePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Get all organization IDs where user is a member (including as owner)
  const organizationIds = await getUserOrganizationIds(payload, user)

  const [participantRole, { docs: orgDocs }] = await Promise.all([
    payload
      .findByID({
        collection: 'participant-roles',
        id: Number(id),
        overrideAccess: false,
        user,
        depth: 0,
      })
      .catch(() => null),
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

  if (!participantRole) notFound()

  // Resolve relationship ID (depth:0 returns number but type allows object)
  const resolveId = (rel: unknown): number | null => {
    if (!rel) return null
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return null
  }

  const defaultValues: ParticipantRoleFormValues = {
    organization: resolveId(participantRole.organization) ?? undefined,
    name: participantRole.name,
    description: participantRole.description ?? null,
    isActive: participantRole.isActive ?? true,
    requiredFields:
      (participantRole.requiredFields as ParticipantRoleFormValues['requiredFields']) ?? [],
    showOptionalFields: participantRole.showOptionalFields ?? false,
    optionalFields:
      (participantRole.optionalFields as ParticipantRoleFormValues['optionalFields']) ?? [],
  }

  const organizations = orgDocs.map((o) => ({ id: o.id, name: o.name }))

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <ParticipantRoleForm
            mode="edit"
            participantRoleId={String(participantRole.id)}
            defaultValues={defaultValues}
            organizations={organizations}
          />
        </div>
      </div>
    </div>
  )
}
