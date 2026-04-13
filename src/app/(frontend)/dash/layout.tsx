import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { DashClientLayout } from './client-layout'
import { getUserOrganizationIds } from '@/access/utilities'
import { getCachedLayoutData } from '@/lib/cached-queries'

/**
 * Server-side layout for /dash routes.
 * Authenticates the user, then uses a cached query to fetch events and
 * permissions — eliminating a blocking DB round-trip on every navigation.
 */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)

  const { events: initialEvents, permissions } = await getCachedLayoutData(
    Number(user.id),
    organizationIds,
  )

  return (
    <DashClientLayout initialEvents={initialEvents} permissions={permissions}>
      {children}
    </DashClientLayout>
  )
}
