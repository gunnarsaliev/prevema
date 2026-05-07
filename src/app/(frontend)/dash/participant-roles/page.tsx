import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds, getCachedParticipantRoles } from '@/lib/cached-queries'
import { ParticipantRolesTable } from './ParticipantRolesTable'
import type { Metadata } from 'next'
import type { ParticipantRole } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Participant Roles',
}

export default async function ParticipantRolesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const participantRoles = await getCachedParticipantRoles(organizationIds)

  return <ParticipantRolesTable participantRoles={participantRoles as ParticipantRole[]} />
}
