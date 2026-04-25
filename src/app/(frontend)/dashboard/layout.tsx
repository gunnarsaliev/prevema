import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { getCachedLayoutData } from '@/lib/cached-queries'
import { PermissionsProvider } from '@/providers/Permissions'

/**
 * Minimal server layout for /dashboard routes.
 * - Authenticates the user (redirects to /admin/login if missing).
 * - Loads cached permissions and exposes them via PermissionsProvider so
 *   client components can read role-based UI affordances.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)

  const { permissions } = await getCachedLayoutData(userId, organizationIds)

  return (
    <PermissionsProvider
      role={permissions.role}
      canEdit={permissions.canEdit}
      canAdmin={permissions.canAdmin}
      isOwner={permissions.isOwner}
    >
      {children}
    </PermissionsProvider>
  )
}
