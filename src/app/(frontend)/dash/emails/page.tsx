import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { EmailsListClient } from './components/EmailsListClient'
import { EmailsListSkeleton } from './components/EmailsListSkeleton'
import type { EmailLog } from '@/payload-types'

async function EmailsData() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  const { docs } = await payload.find({
    collection: 'email-logs',
    overrideAccess: false,
    user,
    depth: 1,
    limit: 200,
    sort: '-createdAt',
  })

  return <EmailsListClient emails={docs as EmailLog[]} />
}

export default async function EmailsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<EmailsListSkeleton />}>
        <EmailsData />
      </Suspense>
    </div>
  )
}
