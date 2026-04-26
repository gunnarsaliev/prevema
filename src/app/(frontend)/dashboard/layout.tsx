import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { getCachedLayoutData } from '@/lib/cached-queries'
import { PermissionsProvider } from '@/providers/Permissions'
import { Separator } from '@/components/ui/separator'
import { DashboardNav } from './components/DashboardNav'

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
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r md:flex md:flex-col">
          <div className="flex h-14 items-center px-6">
            <span className="text-sm font-semibold tracking-tight">Dashboard</span>
          </div>
          <Separator />
          <DashboardNav />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </PermissionsProvider>
  )
}
