import { Heading } from '@/components/catalyst/heading'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashParticipants } from './data'
import { ParticipantsList } from './ParticipantsList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Participants',
}

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const participants = await getTwDashParticipants(userId, organizationIds, eventId)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Participants</Heading>
        </div>
      </div>
      <ParticipantsList participants={participants} />
    </>
  )
}
