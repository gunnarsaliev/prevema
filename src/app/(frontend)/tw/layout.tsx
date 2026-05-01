import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedLayoutData, getCachedUserOrgIds } from '@/lib/cached-queries'
import { ApplicationLayout } from './application-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const { events } = await getCachedLayoutData(userId, organizationIds)

  return <ApplicationLayout events={events}>{children}</ApplicationLayout>
}
