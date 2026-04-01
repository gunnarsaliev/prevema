import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { DashClientLayout } from './client-layout'
import type { Event } from '@/providers/Event'
import { getCurrentUserRole } from '@/lib/getCurrentUserRole'
import { getUserOrganizationIds } from '@/access/utilities'

/**
 * Server-side layout for /dash routes.
 * Authenticates the user and pre-fetches their events using the Payload local API,
 * so the client layout has events available on the first render.
 */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  // Get user's organizations to determine permissions
  const organizationIds = await getUserOrganizationIds(payload, user)

  console.log('🔍 Debug - User organizations:', {
    userId: user.id,
    email: user.email,
    organizationIds,
    count: organizationIds.length,
  })

  // Get the first organization the user has access to (or null if none)
  const firstOrganizationId = organizationIds[0] || null

  // Fetch user's role in their first organization for UI permissions
  const permissions = await getCurrentUserRole(payload, user, firstOrganizationId)

  console.log('🔍 Debug - User permissions:', permissions)

  // Wrap the events fetch in a try-catch to provide better error messages
  let docs: any[] = []
  try {
    const result = await payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: '-createdAt',
      select: { name: true },
    })
    docs = result.docs
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    console.error('User has access to organizations:', organizationIds)
    // Don't fail - just show empty events list
    docs = []
  }

  const initialEvents: Event[] = docs.map((doc) => ({ id: String(doc.id), name: doc.name }))

  return (
    <DashClientLayout initialEvents={initialEvents} permissions={permissions}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
    </DashClientLayout>
  )
}
