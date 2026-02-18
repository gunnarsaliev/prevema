import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ParticipantTypesList } from './components/ParticipantTypesList'

export default async function ParticipantTypesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const { docs } = await payload.find({
    collection: 'participant-types',
    overrideAccess: false,
    user,
    depth: 1, // resolve event name
    limit: 200,
    sort: 'name',
  })

  return (
    <div className="px-6 py-8">
      <ParticipantTypesList participantTypes={docs} />
    </div>
  )
}
